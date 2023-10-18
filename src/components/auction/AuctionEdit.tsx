import { useMutation } from "@tanstack/react-query";
import { Mobile, PC } from "../ResponsiveLayout";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { auctionEdit, auctionWrite } from "@/api/auction/auction";
import { GetAuctionPostsView, Images } from "@/service/my/auction";
import VideoThumbnail from "../VideoThumbnail";
import { useSetRecoilState } from "recoil";
import { isLoggedInState, userAtom } from "@/recoil/user";

interface FileItem {
  idx: number;
  file: File;
  url: string;
  id: number;
  type: string;
  mediaSequence: number;
}

interface Option {
  value: string;
  label: string;
}

const uploadUri = "https://www.reptimate.store/conv/board/upload";

const sellingOption: Option[] = [
  { value: "selling", label: "판매중" },
  { value: "end", label: "판매완료" },
  { value: "reservation", label: "예약중" },
];

const varietyOptions: Option[] = [
  { value: "품종을 선택하세요", label: "품종을 선택하세요" },
  { value: "크레스티드 게코", label: "크레스티드 게코" },
  { value: "레오파드 게코", label: "레오파드 게코" },
  { value: "가고일 게코", label: "가고일 게코" },
  { value: "리키 에너스", label: "리키 에너스" },
  { value: "기타", label: "기타" },
];

const patternOptions: Record<string, Option[]> = {
  "품종을 선택하세요": [
    { value: "모프를 선택하세요", label: "모프를 선택하세요" },
  ],
  // Define patterns for each variety option
  "크레스티드 게코": [
    { value: "", label: "모프를 선택하세요" },
    { value: "노멀", label: "노멀" },
    { value: "릴리 화이트", label: "릴리 화이트" },
    { value: "아잔틱", label: "아잔틱" },
    { value: "릴잔틱", label: "릴잔틱" },
    { value: "헷 아잔틱", label: "헷 아잔틱" },
    { value: "릴리 헷 아잔틱", label: "릴리 헷 아잔틱" },
    { value: "세이블", label: "세이블" },
    { value: "카푸치노", label: "카푸치노" },
    { value: "프라푸치노", label: "프라푸치노" },
    { value: "슈퍼 카푸", label: "슈퍼 카푸" },
    { value: "기타", label: "기타" },
  ],
  "레오파드 게코": [
    { value: "", label: "모프를 선택하세요" },
    { value: "갤럭시", label: "갤럭시" },
    { value: "고스트", label: "고스트" },
    { value: "그린", label: "그린" },
    { value: "노멀", label: "노멀" },
    { value: "다크", label: "다크" },
    { value: "데빌", label: "데빌" },
    { value: "라벤더", label: "라벤더" },
    { value: "레드", label: "레드" },
    { value: "만다린", label: "만다린" },
    { value: "블랙 나이트", label: "블랙 나이트" },
    { value: "블러드", label: "블러드" },
    { value: "블리자드", label: "블리자드" },
    { value: "사이퍼", label: "사이퍼" },
    { value: "스노우", label: "스노우" },
    { value: "기타", label: "기타" },
  ],
  "가고일 게코": [
    { value: "노멀", label: "노멀" },
    { value: "레드", label: "레드" },
    { value: "레티큐어 베이컨", label: "레티큐어 베이컨" },
    { value: "블로치드", label: "블로치드" },
    { value: "스켈레톤", label: "스켈레톤" },
    { value: "스트라이프드", label: "스트라이프드" },
    { value: "옐로우", label: "옐로우" },
    { value: "오렌지", label: "오렌지" },
    { value: "화이트", label: "화이트" },
    { value: "기타", label: "기타" },
  ],
  "리키 에너스": [
    { value: "", label: "모프를 선택하세요" },
    { value: "노멀", label: "노멀" },
    { value: "누아나", label: "누아나" },
    { value: "누아미", label: "누아미" },
    { value: "다스 모울", label: "다스 모울" },
    { value: "다크", label: "다크" },
    { value: "레드바", label: "레드바" },
    { value: "리버만", label: "리버만" },
    { value: "멜라니스 스페셜", label: "멜라니스 스페셜" },
    { value: "모로", label: "모로" },
    { value: "얏트", label: "얏트" },
    { value: "코기스", label: "코기스" },
    { value: "트로거", label: "트로거" },
    { value: "트루 컬러", label: "트루 컬러" },
    { value: "파인 아일랜드", label: "파인 아일랜드" },
    { value: "프리델", label: "프리델" },
    { value: "하키토", label: "하키토" },
    { value: "헬 멜라니스틱", label: "헬 멜라니스틱" },
    { value: "GT", label: "GT" },
    { value: "기타", label: "기타" },
  ],
  기타: [
    { value: "", label: "모프를 선택하세요" },
    { value: "기타", label: "기타" },
  ],
};

const extension_rule: Option[] = [
  { value: "0", label: "미적용" },
  { value: "1", label: "적용" },
];

const alret_time: Option[] = [
  { value: "0", label: "없음" },
  { value: "5", label: "5분" },
  { value: "10", label: "10분" },
  { value: "30", label: "30분" },
  { value: "60", label: "1시간" },
];

export default function AuctionEdit() {
  const router = useRouter();
  const params = useParams();
  const idx = params?.idx;

  function BackButton() {
    const handleGoBack = () => {
      window.history.back(); // Go back to the previous page using window.history
    };

    return (
      <button onClick={handleGoBack} className="cursor-poiter px-2 font-bold">
        &lt; 뒤로가기
      </button>
    );
  }

  let userAccessToken: string | null = null;
  let currentUserIdx: number | null = null;
  let userProfilePath: string | null = null;
  let userNickname: string | null = null;
  if (typeof window !== "undefined") {
    // Check if running on the client side
    const storedData = localStorage.getItem("recoil-persist");
    // console.log(storedData);
    if (storedData != null) {
      const userData = JSON.parse(storedData || "");
      currentUserIdx = userData.USER_DATA.idx;
      userAccessToken = userData.USER_DATA.accessToken;
      userProfilePath = userData.USER_DATA.profilePath;
      userNickname = userData.USER_DATA.nickname;
    }
  }

  const [data, setData] = useState<GetAuctionPostsView | null>(null);
  const [allFiles, setAllFiles] = useState<
    Array<{
      idx: number;
      file: File | null;
      url: string | null;
      id: number;
      type: string;
      mediaSequence: number;
    }>
  >([]);
  const [addFiles, setAddFiles] = useState<
    Array<{
      idx: number;
      file: File | null;
      url: string | null;
      id: number;
      type: string;
      mediaSequence: number;
    }>
  >([]);
  const [deletedFiles, setDeletedFiles] = useState<Array<number>>([]);
  const [mediaSequence, setMediaSequence] = useState<number>(-1);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string>("");

  const [auctionIdx, setAuctionIdx] = useState<string>("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [startPrice, setstartPrice] = useState("");
  const [unit, setunit] = useState("");
  const [endTime, setEndTime] = useState("");
  const [rule, setRule] = useState("");
  const [alretTime, setAlretTime] = useState("");

  const [description, setDescription] = useState("");

  const [selling, setSelling] = useState<string>("selling");
  const [variety, setVariety] = useState<string>("품종을 선택하세요");
  const [pattern, setPattern] = useState<string>("모프를 선택하세요");

  const [isLoading, setIsLoading] = useState(false);

  const setUser = useSetRecoilState(userAtom);
  const setIsLoggedIn = useSetRecoilState(isLoggedInState);

  function getCookie(name: string) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) {
      var cookieValue = parts.pop()?.split(";").shift();
      try {
        var cookieObject = JSON.parse(cookieValue || "");
        return cookieObject;
      } catch (error) {
        console.error("Error parsing JSON from cookie:", error);
        return null;
      }
    }
  }

  useEffect(() => {
    // 안드로이드 웹뷰를 통해 접속한 경우에만 실행됩니다.
    var myAppCookie = getCookie("myAppCookie");

    if (myAppCookie !== undefined) {
      console.log(myAppCookie);
      var accessToken = myAppCookie.accessToken;
      var idx = parseInt(myAppCookie.idx || "", 10) || 0;
      var refreshToken = myAppCookie.refreshToken;
      var nickname = myAppCookie.nickname;
      var profilePath = myAppCookie.profilePath;

      console.log("accessToken: " + accessToken);
      console.log("idx: " + idx);
      console.log("refreshToken: " + refreshToken);
      console.log("nickname: " + nickname);
      console.log("profilePath: " + profilePath);
      setUser({
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
        idx: idx || 0,
        profilePath: profilePath || "",
        nickname: nickname || "",
      });
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    setSelling("selling");
    setRule("0");
  }, []);

  const getData = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://reptimate.store/api/board/${idx}?userIdx=${currentUserIdx}`
      );
      // Assuming your response data has a 'result' property
      setData(response.data);
      console.log(response.data);
      const post = response.data.result;
      setAuctionIdx(post.boardAuction.idx.toString() || "");
      setSelling(post.boardAuction.state);
      setTitle(post?.title || "");
      setVariety(post?.boardAuction.variety || "품종을 선택하세요");
      setPattern(post?.boardAuction.pattern || "모프를 선택하세요");
      setBirthDate(post?.boardAuction.birthDate || "연도-월-일");
      setSelectedGender(post?.boardAuction.gender || "");
      setSelectedSize(post?.boardAuction.size || "");
      setPrice(post?.boardAuction.currentPrice || "");
      setDescription(post?.description || "");
      setstartPrice(post?.boardAuction.startPrice.toString() || "");
      setunit(post?.boardAuction.unit.toString() || "");
      setEndTime(post?.boardAuction.endTime.split(" ")[1] || "");
      setRule(post?.boardAuction.extensionRule || "");
      setAlretTime(post?.boardAuction.AlertTime.split(" ")[1] || "");
      setAllFiles(
        post.images.map((item: Images) => ({
          idx: item.idx,
          id: Date.now() + Math.random(),
          url: item.path,
          type: item.category,
          file: null,
          mediaSequence: item.mediaSequence,
        }))
      );
      console.log(post.images.length);
      if (post.images.length > 0) {
        setMediaSequence(post.images.length - 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    getData();
    console.log(allFiles);
  }, []);

  useEffect(() => {
    console.log(allFiles);
  }, [allFiles]);

  useEffect(() => {
    console.log(deletedFiles);
  }, [deletedFiles]);

  const handleVarietyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVariety = e.target.value;
    setVariety(selectedVariety);

    // Reset pattern when variety changes
    setPattern("모프를 선택하세요");
  };

  const handleSellingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSelling = e.target.value;
    setSelling(selectedSelling);
  };

  const handleRuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRule = e.target.value;
    setRule(selectedRule);
  };

  const handleAlertChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAlert = e.target.value;
    setAlretTime(selectedAlert);
  };

  const handleGenderClick = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setBirthDate(newDate);
  };

  const [showFileLimitWarning, setShowFileLimitWarning] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: FileItem[] = Array.from(files)
        .slice(0, 5 - allFiles.length)
        .map((file, index) => ({
          idx: 0,
          file,
          id: Date.now() + Math.random(),
          url: "", // 새로 업로드할 파일의 경우 URL은 null로 설정
          type: file.type,
          mediaSequence: mediaSequence + index + 1, // Increment mediaSequence based on index
        }));

      setMediaSequence(mediaSequence + newFiles.length);

      if (allFiles.length + newFiles.length > 5) {
        setShowFileLimitWarning(true);
      } else {
        setAllFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setAddFiles((prevFiles) => [...prevFiles, ...newFiles]);
      }
    }
  };

  const handleRemoveItem = (id: number, idx: number) => {
    setAllFiles((prevUrlImages) =>
      prevUrlImages.filter((item) => item.id !== id)
    );
    setAddFiles((prevUrlImages) =>
      prevUrlImages.filter((item) => item.id !== id)
    );
    if (idx !== 0) {
      setDeletedFiles((prevDeletedFiles) => [...prevDeletedFiles, idx]);
    }
  };

  const moveFile = (dragIndex: number, hoverIndex: number) => {
    const draggedFile = allFiles[dragIndex];
    const updatedFiles = [...allFiles];
    updatedFiles.splice(dragIndex, 1);
    updatedFiles.splice(hoverIndex, 0, draggedFile);
    setAllFiles(updatedFiles);
  };

  const FileItem = ({
    fileItem,
    index,
  }: {
    fileItem: {
      idx: number;
      file: File | null;
      url: string | null;
      id: number;
      type: string;
    };
    index: number;
  }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "FILE",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "FILE",
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveFile(item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <div ref={(node) => drag(drop(node))}>
        <div
          key={fileItem.id}
          className="relative w-32 h-32 mx-2 border-2 border-gray-200"
          onClick={(e) => e.preventDefault()}
        >
          {fileItem.file?.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(fileItem.file)}
              alt={`Image ${fileItem.id}`}
              className="object-cover w-full h-full"
            />
          ) : fileItem.file?.type.startsWith("video/") ? (
            <video className="object-cover w-full h-full">
              <source
                src={URL.createObjectURL(fileItem.file)}
                type={fileItem.file.type}
              />
              현재 브라우저는 비디오 태그를 지원하지 않습니다.
            </video>
          ) : fileItem.type == "img" ? (
            <img
              src={fileItem.url || ""}
              alt={`Image ${fileItem.id}`}
              className="object-cover w-full h-full"
            />
          ) : fileItem.type == "video" ? (
            <VideoThumbnail src={fileItem.url || ""} type="m3u8" />
          ) : (
            <p>지원하지 않는 파일 형태</p>
          )}
          <button
            onClick={() => handleRemoveItem(fileItem.id, fileItem.idx)}
            className="absolute -top-2 -right-2 transform translate-x-1/4 -translate-y-1/4 w-6 h-6 bg-red-500 text-white rounded-full"
          >
            X
          </button>
        </div>
      </div>
    );
  };

  const mutation = useMutation({
    mutationFn: auctionEdit,
    onSuccess: (data) => {
      console.log("============================");
      console.log("Successful Editing of post!");
      console.log(data);
      console.log(data.data);
      console.log("============================");
      alert("게시글 수정이 완료되었습니다.");
      router.replace(`/auction/posts/${idx}`);
    },
  });
  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 해주고 2자리로 포맷
    const day = String(today.getDate()).padStart(2, "0"); // 일자를 2자리로 포맷

    const formattedDate = `${year}-${month}-${day}`;

    const minutesToSubtract = parseInt(alretTime, 10);

    const newTime = new Date(today.getTime() - minutesToSubtract * 60000);

    // newTime을 원하는 형식으로 포맷팅하기 (예: "2023-09-14 12:30" 형태)
    const newYear = newTime.getFullYear();
    const newMonth = String(newTime.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더하고 두 자리로 포맷팅
    const newDay = String(newTime.getDate()).padStart(2, "0");
    const hours = String(newTime.getHours()).padStart(2, "0");
    const minutes = String(newTime.getMinutes()).padStart(2, "0");

    const formattedTime = `${newYear}-${newMonth}-${newDay}T${hours}:${minutes}`;

    const requestData = {
      auctionIdx: auctionIdx,
      state: selling,
      boardIdx: idx || "",
      userIdx: currentUserIdx?.toString() || "",
      title: title,
      category: "auction",
      description: description,
      price: price,
      gender: selectedGender || "",
      size: selectedSize || "",
      variety: variety,
      pattern: pattern,
      startPrice: startPrice,
      unit: unit,
      endTime: formattedDate + "T" + endTime,
      alertTime: formattedTime,
      extensionRule: rule,
      birthDate: birthDate,
      userAccessToken: userAccessToken || "",
      fileUrl: "",
    };

    if (
      title !== "" &&
      price !== "" &&
      selectedGender !== "" &&
      selectedSize !== "" &&
      variety !== "" &&
      pattern !== "" &&
      startPrice !== "" &&
      unit !== "" &&
      endTime !== "" &&
      rule !== "" &&
      birthDate !== ""
    ) {
      if (allFiles.length + addFiles.length + deletedFiles.length === 0) {
        console.log(requestData);
        mutation.mutate(requestData);
      } else {
        console.log(addFiles);

        const formData = new FormData();
        addFiles.forEach((fileItem) => {
          formData.append("files", fileItem.file || "");
        });

        const modifySqenceArr = allFiles.map((item) => item.mediaSequence);
        const deleteIdxArr = deletedFiles;
        const FileIdx = addFiles.map((item) => item.mediaSequence);
        // Append JSON data to the FormData object
        formData.append("modifySqenceArr", JSON.stringify(modifySqenceArr));
        formData.append("deleteIdxArr", JSON.stringify(deleteIdxArr));
        formData.append("FileIdx", JSON.stringify(FileIdx));

        try {
          // Send both FormData and JSON data to the server
          const response = await axios.patch(
            `https://www.reptimate.store/conv/board/update/${idx}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${userAccessToken}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log(response.data);

          if (response.status === 201) {
            const responseData = response.data;

            console.log(responseData);
            // Now, you can send additional data to the API server
            const requestData1 = {
              auctionIdx: auctionIdx,
              state: selling,
              boardIdx: idx,
              userIdx: currentUserIdx?.toString() || "",
              title: title,
              category: "auction",
              description: description,
              price: price,
              gender: selectedGender || "",
              size: selectedSize || "",
              variety: variety,
              pattern: pattern,
              startPrice: startPrice,
              unit: unit,
              endTime: formattedDate + "T" + endTime,
              alertTime: formattedTime,
              extensionRule: rule,
              birthDate: birthDate,
              userAccessToken: userAccessToken || "",
              fileUrl: responseData.result, // Use the response from the first server
            };

            console.log(requestData1);

            mutation.mutate(requestData1);
          } else {
            console.error("Error uploading files to the first server.");
            alert("Error uploading files. Please try again later.");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred. Please try again later.");
        }
      }
    } else {
      // Create a list of missing fields
      const missingFields = [];
      if (title === "") missingFields.push("제목");
      if (variety === "") missingFields.push("품종");
      if (pattern === "") missingFields.push("모프");
      if (startPrice === "" || "null") missingFields.push("시작 가격");
      if (unit === "" || "null") missingFields.push("경매 단위");
      if (endTime === "" || "null") missingFields.push("마감 시간");
      if (rule === "" || "null") missingFields.push("연장 룰");
      if (birthDate === "") missingFields.push("생년월일");
      if (selectedGender === "" || "null") missingFields.push("성별");
      if (selectedSize === "" || "null") missingFields.push("크기");
      if (price === "") missingFields.push("가격");

      // Create the alert message based on missing fields
      let alertMessage = "아래 입력칸들은 공백일 수 없습니다. :\n";
      alertMessage += missingFields.join(", ");

      alert(alertMessage);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-screen-md mx-auto">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-main-color"></div>
        </div>
      )}
      <PC>
        <h2 className="flex flex-col items-center justify-center text-4xl font-bold p-10">
          경매 등록
        </h2>
      </PC>
      <Mobile>
        <h2 className="flex flex-col items-center justify-center text-xl font-bold p-10">
          경매 등록
        </h2>
      </Mobile>
      <p className="font-bold text-sm">거래 상태</p>
      <select
        className="focus:outline-none text-sm mb-6"
        value={selling}
        onChange={handleSellingChange}
      >
        {sellingOption.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="">
        <input
          type="file"
          accept="image/*, video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="mediaInput"
          max="5"
        />
        <label
          className="flex overflow-x-auto border-2 border-gray-300 items-center justify-center py-3 cursor-pointer mx-auto"
          htmlFor="mediaInput"
        >
          {allFiles.length === 0 && (
            <div className="w-32 h-32 flex flex-col items-center justify-center">
              <img
                src="/img/camera.png"
                alt="Camera Icon"
                className="w-16 h-16"
              />
              <span className="">사진 업로드</span>
            </div>
          )}
          {allFiles.map((file, index) => (
            <FileItem key={index} fileItem={file} index={index} />
          ))}
        </label>
      </div>
      <div className="mt-4 flex flex-col">
        <p className="font-bold text-xl my-2">제목</p>
        <input
          type="text"
          placeholder="제목을 입력해주세요."
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="font-bold text-xl my-2">즉시 구입가</p>
        <input
          type="number"
          placeholder="즉시 구입가를 선택하시지 않으시면 빈칸으로 해주세요. (원)"
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <p className="font-bold text-xl my-2">시작 가격</p>
        <input
          type="number"
          placeholder="시작 가격을 입력해주세요. (원)"
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={startPrice}
          onChange={(e) => setstartPrice(e.target.value)}
        />
        <p className="font-bold text-xl my-2">경매 단위</p>
        <input
          type="number"
          placeholder="경매 단위를 입력해주세요. (원)"
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={unit}
          onChange={(e) => setunit(e.target.value)}
        />
        <p className="font-bold text-xl my-2">마감 시간</p>
        <input
          type="time"
          placeholder="마감 시간을 입력해주세요."
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <p className="font-bold text-xl my-2">연장 룰</p>
        <select
          className="focus:outline-none text-sm mb-6"
          value={rule}
          onChange={handleRuleChange}
        >
          {extension_rule.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="font-bold text-xl my-2">알림 설정</p>
        <select
          className="focus:outline-none text-sm mb-6"
          value={alretTime}
          onChange={handleAlertChange}
        >
          {alret_time.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="font-bold text-xl my-2">품종</p>
        <select
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={variety}
          onChange={handleVarietyChange}
        >
          {varietyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="font-bold text-xl my-2">모프</p>
        {variety !== "품종을 선택하세요" && patternOptions[variety] && (
          <select
            className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          >
            {patternOptions[variety].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <p className="font-bold text-xl my-2">생년월일</p>
        <input
          type="date"
          placeholder="선택해주세요."
          className="focus:outline-none py-[8px] border-b-[1px] text-[17px] w-full"
          value={birthDate}
          onChange={handleDateChange}
        />
        <p className="font-bold text-xl my-2">성별</p>
        <div className="flex flex-row items-center justify-center">
          <button
            className={`w-52 py-2 rounded ${
              selectedGender === "수컷"
                ? "bg-gender-male-dark-color"
                : "bg-gender-male-color"
            } text-lg text-white font-bold`}
            onClick={() => handleGenderClick("수컷")}
          >
            수컷
          </button>
          <button
            className={`w-52 py-2 rounded ${
              selectedGender === "암컷"
                ? "bg-gender-female-dark-color"
                : "bg-gender-female-color"
            } text-lg text-white font-bold`}
            onClick={() => handleGenderClick("암컷")}
          >
            암컷
          </button>
          <button
            className={`w-52 py-2 rounded ${
              selectedGender === "미구분"
                ? "bg-gender-none-dark-color"
                : "bg-gender-none-color"
            } text-lg text-white font-bold`}
            onClick={() => handleGenderClick("미구분")}
          >
            미구분
          </button>
        </div>
        <p className="font-bold text-xl my-2">크기</p>
        <div className="flex flex-row items-center justify-center">
          <button
            className={`w-36 py-2 mx-0.5 rounded ${
              selectedSize === "베이비"
                ? "bg-main-color"
                : "bg-gender-none-color"
            } text-lg text-white font-bold`}
            onClick={() => handleSizeClick("베이비")}
          >
            베이비
          </button>
          <button
            className={`w-36 py-2 mx-0.5 rounded ${
              selectedSize === "아성체"
                ? "bg-main-color"
                : "bg-gender-none-color"
            } text-lg text-white font-bold`}
            onClick={() => handleSizeClick("아성체")}
          >
            아성체
          </button>
          <button
            className={`w-36 py-2 mx-0.5 rounded ${
              selectedSize === "준성체"
                ? "bg-main-color"
                : "bg-gender-none-color"
            } text-lg text-white font-bold`}
            onClick={() => handleSizeClick("준성체")}
          >
            준성체
          </button>
          <button
            className={`w-36 py-2 mx-0.5 rounded ${
              selectedSize === "성체" ? "bg-main-color" : "bg-gender-none-color"
            } text-lg text-white font-bold`}
            onClick={() => handleSizeClick("성체")}
          >
            성체
          </button>
        </div>
        <p className="font-bold text-xl my-2">내용</p>
        <textarea
          placeholder="내용을 입력해주세요."
          className="focus:outline-none px-2 py-2 border-gray-400 border-2 text-17px w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10} // 세로 행의 개수를 조절합니다.
        />
      </div>
      {!isLoading ? (
        <form onSubmit={onSubmitHandler}>
          <button
            type="submit"
            className="items-center cursor-pointer inline-flex justify-center text-center align-middle bg-main-color text-white font-bold rounded-[12px] text-[16px] h-[52px] w-full my-10"
          >
            경매 등록
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="items-center cursor-not-allowed inline-flex justify-center text-center align-middle bg-gray-300 text-gray-500 font-bold rounded-[12px] text-[16px] h-[52px] w-full my-10"
          disabled
        >
          등록 중...
        </button>
      )}
    </div>
  );
}
