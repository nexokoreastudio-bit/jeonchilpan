import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

export const dynamic = 'force-static'
import { ShareButton, CopyButton } from '@/components/location/share-button'
import styles from './location.module.css'

export const metadata: Metadata = {
  title: '오시는 길 | NEXO Daily',
  description: '검단 지식산업센터 제조동 527호 (주)넥소 오시는 길 안내. 차량으로 5층까지 올라오실 수 있습니다.',
}

export default function LocationPage() {
  const shareText = `🚗 검단 지식산업센터 제조동 527호 (주)넥소 오시는 길 안내

주차장 입구가 제조동 / 기숙사동 두 곳입니다.

반드시 제조동 입구로 진입해주세요.

차량으로 램프를 타고 5층까지 올라오실 수 있습니다.

5층 도착 후 제조동 527호로 오시면 됩니다.

📍 주소: 인천광역시 서구 보듬로158 블루텍 527호 (제조동)
(사진 안내 참고)

🔗 상세 안내: ${process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'}/location`

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          검단 지식산업센터 제조동 527호 (주)넥소 오시는 길
        </h1>
        <p className={styles.subtitle}>
          차량으로 5층까지 올라오실 수 있습니다
        </p>
      </header>

      {/* 공유 버튼 */}
      <div className={styles.shareSection}>
        <ShareButton />
      </div>

      {/* STEP 1 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>1️⃣</div>
        <h2 className={styles.stepTitle}>STEP 1: 건물 진입 전 (입구 선택)</h2>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <div className={styles.imageWrapper}>
              <Image
                src="/assets/images/location/step1-manufacturing-entrance.png"
                alt="제조동 입구 - 올바른 입구"
                width={600}
                height={400}
                className={styles.image}
                priority
              />
              <div className={styles.overlay}>
                <div className={styles.correctArrow}>
                  <span className={styles.arrowText}>✅ 제조동 입구</span>
                </div>
              </div>
            </div>
            <div className={styles.description}>
              <p className={styles.correctText}>
                <strong>✅ 제조동 입구</strong>로 들어오세요!
              </p>
            </div>
          </div>
          <div className={styles.comparisonItem}>
            <div className={styles.imageWrapper}>
              <Image
                src="/assets/images/location/step1-dormitory-entrance.png"
                alt="기숙사동 입구 - 가면 안 되는 입구"
                width={600}
                height={400}
                className={styles.image}
                priority
              />
              <div className={styles.overlay}>
                <div className={styles.wrongMark}>
                  <span className={styles.wrongText}>❌ 기숙사동 입구</span>
                </div>
              </div>
            </div>
            <div className={styles.description}>
              <p className={styles.wrongText}>
                <strong>❌ 기숙사동 입구</strong>로 들어가면 찾기 어렵습니다!
              </p>
            </div>
          </div>
        </div>
        <div className={styles.addressBox}>
          <p className={styles.address}>
            <strong>주소:</strong> 인천시 서구 보듬로158 검단지식산업센터 블루텍 <span className={styles.highlightBuilding}>제조동</span> 527호
          </p>
        </div>
      </section>

      {/* STEP 2 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>2️⃣</div>
        <h2 className={styles.stepTitle}>STEP 2: 램프 따라 5층까지 올라가기</h2>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/images/location/step1-manufacturing-entrance.png"
            alt="제조동 입구로 진입 후 램프를 따라 올라가기"
            width={1200}
            height={800}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <div className={styles.rampArrow}>
              <span className={styles.arrowText}>🚗 제조동 입구로 진입하세요</span>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p>
            제조동 입구로 진입하신 후 램프를 따라 <strong>5층까지</strong> 올라오시면 됩니다.
          </p>
        </div>
      </section>

      {/* STEP 3 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>3️⃣</div>
        <h2 className={styles.stepTitle}>STEP 3: 좌측 램프를 따라 5층까지 올라가기</h2>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/images/location/step3-height-restriction.png"
            alt="높이 제한 3.6M 표지판"
            width={1200}
            height={800}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <div className={styles.yellowOverlayBox}>
              <span className={styles.yellowOverlayText}>🚗 제조동 입구 진입 후 좌측 램프를 따라 5층까지 올라오세요</span>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p>
            제조동 입구 진입 후 <strong>좌측 램프</strong>를 따라 <strong>5층까지</strong> 올라오세요.
          </p>
        </div>
      </section>

      {/* STEP 4 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>4️⃣</div>
        <h2 className={styles.stepTitle}>STEP 4: 5층 글씨가 보이면 직진</h2>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/images/location/step3-5f-straight.png"
            alt="5층 글씨가 보이면 직진"
            width={1200}
            height={800}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <div className={styles.directionMark}>
              <span className={styles.directionText}>📍 5층 글씨가 보이면 직진하세요</span>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p>
            <strong className={styles.roomNumber}>5층</strong> 표시가 보이면 <strong>직진</strong>하세요.
          </p>
        </div>
      </section>

      {/* STEP 5 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>5️⃣</div>
        <h2 className={styles.stepTitle}>STEP 5: 태성정밀 간판이 보이는 곳까지 와서 좌회전</h2>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/images/location/step4-turn-left.png"
            alt="태성정밀 간판이 보이는 곳까지 와서 좌회전"
            width={1200}
            height={800}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <div className={styles.highlightBoxBottom}>
              <span className={styles.highlightText}>⬅️ 태성정밀 간판이 보이면 좌회전하세요</span>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p>
            <strong>태성정밀</strong> 간판이 보이는 곳까지 오신 후 <strong className={styles.turnLeftText}>좌회전</strong>하세요.
          </p>
        </div>
      </section>

      {/* STEP 6 */}
      <section className={styles.step}>
        <div className={styles.stepNumber}>6️⃣</div>
        <h2 className={styles.stepTitle}>STEP 6: 좌회전 하자 마자 우측에 527호 넥소가 있음</h2>
        <div className={styles.imageWrapper}>
          <Image
            src="/assets/images/location/step5-room527.png"
            alt="좌회전 하자 마자 우측에 527호 넥소"
            width={1200}
            height={800}
            className={styles.image}
          />
          <div className={styles.overlay}>
            <div className={styles.finalMark}>
              <span className={styles.finalText}>🎯 제조동 527호 도착!</span>
            </div>
          </div>
        </div>
        <div className={styles.description}>
          <p className={styles.finalDescription}>
            좌회전 하자 마자 <strong className={styles.finalRoomNumber}>우측에 527호 넥소</strong>가 있습니다! 🎉
          </p>
        </div>
      </section>

      {/* 최종 안내 문구 */}
      <section className={styles.finalInfo}>
        <h2 className={styles.finalInfoTitle}>⭐ 고객용 최종 안내 문구</h2>
        <div className={styles.finalInfoBox}>
          <p className={styles.finalInfoText}>{shareText}</p>
          <CopyButton text={shareText} />
        </div>
      </section>

      {/* 주소 정보 */}
      <section className={styles.addressSection}>
        <h2 className={styles.addressTitle}>📍 주소 정보</h2>
        <div className={styles.addressBox}>
          <p className={styles.address}>
            <strong>인천광역시 서구 보듬로158 블루텍 527호 <span className={styles.highlightBuilding}>(제조동)</span></strong>
          </p>
          <p className={styles.addressDetail}>
            (주)넥소 | Tel: 032-569-5771~2
          </p>
        </div>
      </section>

      {/* 홈으로 돌아가기 */}
      <div className={styles.backLink}>
        <Link href="/" className={styles.backButton}>
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
