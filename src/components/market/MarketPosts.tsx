"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Mobile, PC } from "../ResponsiveLayout";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isLoggedInState, userAtom } from "@/recoil/user";
import PostCard from "../PostCard";
import { Adpotion, getResponse } from "@/service/my/adoption";
import BannerSlider from "../BannerSlider";

interface Option {
  value: string;
  label: string;
}

const sortOption: Option[] = [
  { value: "order=DESC&orderCriteria=created", label: "최신순" },
  { value: "order=ASC&orderCriteria=created", label: "오래된 순" },
  { value: "order=DESC&orderCriteria=view", label: "조회 높은 순" },
  { value: "order=ASC&orderCriteria=view", label: "조회 낮은 순" },
  { value: "order=DESC&orderCriteria=price", label: "가격 높은 순" },
  { value: "order=ASC&orderCriteria=price", label: "가격 낮은 순" },
];

export default function MarketPosts() {
  const [data, setData] = useState<getResponse | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("order=DESC&orderCriteria=created");
  const [existNextPage, setENP] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLogin = useRecoilValue(userAtom);
  const target = useRef(null);

  const options = {
    threshold: 1.0,
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSort = e.target.value;
    setSort(selectedSort);
    setPage(1);
    setData(null);
  };

  const getItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/board?page=${page}&size=20&${sort}&category=market`
      );
      setData(
        (prevData) =>
          ({
            result: {
              items: [
                ...(prevData?.result.items || []),
                ...response.data.result.items,
              ],
              existsNextPage: response.data.result.existsNextPage,
            },
          } as getResponse)
      );
      setENP(response.data?.result.existsNextPage);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    getItems();
  }, [sort]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading && existNextPage) {
          getItems();
        }
      });
    }, options);

    if (target.current) {
      observer.observe(target.current);
    }

    return () => {
      if (target.current) {
        observer.unobserve(target.current);
      }
    };
  }, [getItems, existNextPage, loading, options]);

  const handleWriteClick = () => {
    // Handle the logic for opening the write page
    location.href = `market/write`;
  };

  const itemlist: Adpotion[] =
    data !== null && data.result.items
      ? data.result.items.map((item) => ({
          idx: item.idx,
          view: item.view,
          userIdx: item.userIdx,
          title: item.title,
          category: item.category,
          writeDate: new Date(item.writeDate),
          thumbnail: item.thumbnail,
          nickname: item.UserInfo.nickname,
          profilePath: item.UserInfo.profilePath,
          price: item.boardCommercial.price,
          gender: item.boardCommercial.gender,
          size: item.boardCommercial.size,
          variety: item.boardCommercial.variety,
          state: item.boardCommercial.state,
        }))
      : [];

  return (
    <section>
      <BannerSlider />
      <PC>
        <div className="flex items-center relative" style={{marginLeft:40, marginRight:40}}>
          <h2 className="font-bold text-[20px]">중고 거래</h2>
          <div className="relative ml-auto">
            <select
              className="text-black bg-white p-1 border-[1px] rounded-md focus:outline-none text-sm my-2 "
              value={sort}
              onChange={handleSortChange}
            >
              {sortOption.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PC>
      {/* 솔트링 콤보 박스 모바일 - 모바일은 마진 좌우 값이 없음 */}
      <Mobile>
        <div className="flex items-center relative ml-[16px] mr-[16px]">
          <h2 className="text-lg font-bold my-2">중고 거래</h2>
          <div className="relative ml-auto">
            <select
              className="text-black bg-white p-1 border-[1px] rounded-md focus:outline-none text-sm my-2"
              value={sort}
              onChange={handleSortChange}
            >
              {sortOption.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Mobile>
      {/* 게시글 목록 PC */}
      <PC>
        {data !== null && data.result.items ? (
          <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5"  style={{marginLeft:40,marginRight:40}}>
            {itemlist.map((post) => (
              <li key={post.idx}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-t-4 border-main-color border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </PC>
      {/* 게시글 목록 모바일 */}
      <Mobile>
        {data !== null && data.result.items ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-4"  style={{marginLeft:16,marginRight:16}}>
            {itemlist.map((post) => (
                <PostCard post={post} key={post.idx}/>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-t-4 border-main-color border-solid rounded-full animate-spin"></div>
          </div>
        )}
      </Mobile>

      {existNextPage && (
        <div className="flex justify-center">
          <div
            className="w-16 h-16 border-t-4 border-main-color border-solid rounded-full animate-spin"
            ref={target}
          ></div>
        </div>
      )}
   
      <PC>
        {isLogin && (
          <div className="fixed bottom-10 right-10 z-50">
            <button
              className="w-16 h-16 rounded-full bg-main-color text-white flex justify-center items-center text-5xl"
              onClick={handleWriteClick}
            >
              +
            </button>
          </div>
        )}
      </PC>
      <Mobile>
        {isLogin && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              className="w-16 h-16 rounded-full bg-main-color text-white flex justify-center items-center text-5xl"
              onClick={handleWriteClick}
            >
              +
            </button>
          </div>
        )}
      </Mobile>
    </section>
  );
}
