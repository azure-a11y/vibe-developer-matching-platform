import { ComingSoon } from '@/components/ComingSoon';

export default function PermissionsPage() {
  return (
    <ComingSoon
      title="계정 · 권한"
      description="관리자 계정·등급·메뉴별 권한 매트릭스, 빌더 개별 권한을 관리하는 화면입니다. 실제 인증(로그인) 구현이 선행되어야 의미가 있습니다(WO-3 흡수)."
      reference="docs/project/04_정책정의.md §4, docs/project/06_데이터모델.md §3.6"
    />
  );
}
