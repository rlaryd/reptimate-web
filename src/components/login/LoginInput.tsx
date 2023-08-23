"use client";

import { useForm } from 'react-hook-form';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LoginInput() {
    // const [userInfo, setUserInfo] = useState<UserInfoType>({
    //     email: "",
    //     password: "",
    //   });

    // const { email, password } = userInfo;

    //   // onChange
    // const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = event.target;
  
    //     setUserInfo({
    //     ...userInfo, // 기존의 input 객체를 복사한 뒤
    //     [name]: value, // name 키를 가진 값을 value 로 설정
    //     });
    // };
  
    // // 전송
    // const handleSubmit = (event: { preventDefault: () => void }) => {
    //     setUserInfo({ email: "", password: "" });
    //     event.preventDefault();
    // };

  return (
    <div className="m-o m-auto pt-16 px-0 pb-40 w-[400px]">



        <div className="relative pt-2.5 pb-3.5">
            <h3 className="text-lg tracking-thighter">이메일</h3>
            <div className="relative">
                <input
                className="w-full leading-5 text-base border-b-2 focus:border-b-3 border-b-gray-200 focus:border-b-main-color focus:pb-2 py-2 focus:outline-none"
                type="email" id="email" name="email" required placeholder="예) repti@mate.co.kr"></input>
            </div>
            <p className="hidden text-xs leading-4 absolute">이메일 주소를 정확히 입력해주세요.</p>
        </div>
        <div className="relative pt-2.5 pb-3.5">
            <h3 className="text-lg tracking-thighter">비밀번호</h3>
            <div className="relative">
                <input
                className="w-full leading-5 text-base border-b-2 focus:border-b-3 border-b-gray-200 focus:border-b-main-color focus:pb-2 py-2 focus:outline-none" 
                type="password" id="password" required></input>                       
            </div>
            <p className="hidden text-xs leading-4 absolute">영문, 숫자, 특수문자를 조합해서 입력해주세요. (8-16자)</p>
        </div>

        <div className="pt-5">
            <a href="#" 
            className="text-white inline-flex cursor-pointer items-center justify-items-center justify-center align-middle text-center bg-main-color font-bold w-full text-base trackting-[-.16px] h-14 rounded-xl"> 로그인 </a>
        </div>
        <ul className="flex justify-evenly mt-5">
            <li className="inline-flex flex-1">
                <a href="/join" className="inline-flex text-[13px] tracking-[-.07px] m-auto px-[10px]"> 이메일 가입 </a>
            </li>
            <li className=' bg-[#d3d3d3] inline-block h-[13px] mt-[3px] w-[1px]'></li>
            <li className="inline-flex flex-1">
                <a href="/login/find_password" className="inline-flex text-[13px] tracking-[-.07px] m-auto px-[10px]"> 비밀번호 찾기 </a>
            </li>
        </ul>

        <div className="mt-[40px]">
            <button type="button" className="relative text-[#222] border-[#ebebeb] inline-flex cursor-pointer items-center justify-center align-middle text-center bg-[#fff] w-full text-[16px] tracking-[-.16px] h-14 rounded-xl border-[1px] mb-[8px]" data-v-43813796 data-v-2b15bea4>
                <img className="h-[24px] left-[15px] absolute top-[13px] w-[24px]" src="/login/pngegg.png" alt=""></img>
                카카오로 로그인 
            </button>
            <button type="button" className="relative text-[#222] border-[#ebebeb] inline-flex cursor-pointer items-center justify-center align-middle text-center bg-[#fff] w-full text-[16px] tracking-[-.16px] h-14 rounded-xl border-[1px] mb-[8px]" data-v-43813796 data-v-2b15bea4>
                <img className="h-[24px] left-[15px] absolute top-[13px] w-[24px]" src="/login/ic_google.png" alt=""></img>
                Google로 로그인 
            </button>
            <button type="button" className="relative text-[#222] border-[#ebebeb] inline-flex cursor-pointer items-center justify-center align-middle text-center bg-[#fff] w-full text-[16px] tracking-[-.16px] h-14 rounded-xl border-[1px] mb-[8px]" data-v-43813796 data-v-2b15bea4>
                <img className="h-[24px] left-[15px] absolute top-[13px] w-[24px]" src="/login/ic_apple.png" alt=""></img>
                Apple로 로그인 
            </button>

        </div>



    </div>
        
    
  );
}