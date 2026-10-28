import { redirect } from 'next/navigation';

/** 관리자도 손님과 같은 로그인 화면을 쓴다. 예전 주소로 들어오면 그쪽으로 보낸다. */
export default function AdminLoginPage() {
  redirect('/login?next=/admin');
}
