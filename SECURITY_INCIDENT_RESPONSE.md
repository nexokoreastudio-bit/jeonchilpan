# 보안 사고 대응 가이드

## 🚨 비밀키 유출 사고 대응 절차

### 1. 즉시 조치 사항

#### Step 1: 유출된 키 무효화
1. **Supabase Dashboard** 접속
2. **Settings** > **API** 이동
3. **Secret keys** 섹션에서:
   - 유출된 Service Role Key 찾기
   - **"Rotate"** 또는 **"Revoke"** 버튼 클릭
   - 새 키 생성

#### Step 2: 새 키로 교체
1. 새로 생성된 Service Role Key 복사
2. 다음 위치의 환경 변수 업데이트:
   - 로컬: `.env.local`
   - Netlify: Dashboard > Environment variables
   - 기타 배포 환경

#### Step 3: GitHub 알림 해결
1. **Supabase에서 키 Rotate** 후 GitHub 저장소 > **Security** > **Secret scanning alerts** 이동
2. 해당 알림 클릭 → **"Mark as resolved"** 또는 **"Revoke secret"** 선택
3. Supabase에서 키를 이미 교체했다면 **"I've rotated this secret"** 선택

#### Step 4: Git 히스토리 정리 (선택, 히스토리 완전 삭제 시)
```bash
# git-filter-repo 설치: pip install git-filter-repo
# 또는 BFG: https://rtyley.github.io/bfg-repo-cleaner/

# git-filter-repo로 비밀 포함 파일 히스토리에서 제거
git filter-repo --path REFACTORING_SETUP.md --invert-paths --force

# 강제 푸시 (주의: 팀원과 협의 필요)
git push origin --force --all
```

### 2. 예방 조치

#### ✅ 완료된 조치
- [x] 모든 문서에서 실제 비밀키 제거
- [x] 플레이스홀더로 교체 (`your-service-role-key-here`)
- [x] `.gitignore`에 `.env.local` 추가 확인

#### 📋 추가 권장 사항
- [ ] Git pre-commit hook 설정 (비밀키 커밋 방지)
- [ ] GitHub Secret Scanning 활성화 확인
- [ ] 정기적인 보안 감사
- [ ] 팀원 보안 교육

### 3. 감지된 비밀키

GitHub Secret Scanning에서 감지된 키:
- **Service Role Key**: JWT 형식 (eyJ로 시작)
- **위치**: 문서 파일들 (REFACTORING_SETUP.md 등)

### 4. 영향 범위

- **영향받는 파일**: 문서 파일들 (`.md`)
- **실제 코드**: 영향 없음 (환경 변수 사용)
- **배포 환경**: Netlify 환경 변수 확인 필요

### 5. 복구 확인

다음 명령어로 비밀키가 제거되었는지 확인:

```bash
# JWT 토큰 형식 검색 (실제 키로 교체하여 사용)
grep -r "eyJ" . --exclude-dir=node_modules --exclude-dir=.git | grep -v "your-.*-key-here"
```

**예상 결과**: 검색 결과 없음 (또는 플레이스홀더만)

---

## 📞 문의

보안 관련 문의사항이 있으시면 프로젝트 관리자에게 연락하세요.


