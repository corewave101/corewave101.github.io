let currentSlide = 1;
const totalSlides = 4;
let viewerInit = false; // 3D 모델 중복 로드 방지

// 아미노산 랜덤 배경 생성 (3페이지 시각효과용)
function generateSequenceBg() {
    const bg = document.getElementById('seq-bg');
    const aa = "ACDEFGHIKLMNPQRSTVWY";
    let str = "";
    for(let i=0; i<5000; i++) {
        str += aa[Math.floor(Math.random() * aa.length)];
    }
    bg.innerText = str;
}
generateSequenceBg();

function updateSlides() {
    // 슬라이드 클래스 초기화 (Motion Graphic 효과를 위해 past, active, next 계산)
    for (let i = 1; i <= totalSlides; i++) {
        const slide = document.getElementById(`slide${i}`);
        slide.className = 'slide'; // 초기화
        
        if (i < currentSlide) {
            slide.classList.add('past');
        } else if (i === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.add('next');
        }
    }
    
    document.getElementById('page-indicator').innerText = `${currentSlide} / ${totalSlides}`;

    // 2페이지 진입 시 3D 모델 초기화 및 회전 시작
    if (currentSlide === 2 && !viewerInit) {
        init3DModel();
        viewerInit = true;
    }

    // 3페이지 진입 시 서열 줌인(확대) 애니메이션 트리거
    if (currentSlide === 3) {
        // 약간의 딜레이 후 줌인 발동
        setTimeout(() => {
            document.getElementById('seq-bg').classList.add('zoomed');
            document.getElementById('seq-table').classList.add('show');
        }, 500);
    } else {
        // 다른 페이지로 가면 애니메이션 초기화
        document.getElementById('seq-bg').classList.remove('zoomed');
        document.getElementById('seq-table').classList.remove('show');
    }
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlides();
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlides();
    }
}

// 3Dmol.js를 이용한 GAPDH 효소(8G17) 모델링 함수
function init3DModel() {
    const element = document.querySelector('#model3d');
    const config = { backgroundColor: 'white' };
    const viewer = $3Dmol.createViewer(element, config);
    
    // RCSB 서버에서 직접 8G17 PDB 데이터를 다운로드하여 렌더링
    $3Dmol.download("pdb:8G17", viewer, {doAssembly: true, noAssembly: false}, function() {
        // 복합체 구조를 각 체인별로 색상을 다르게 칠함
        viewer.setStyle({chain: 'A'}, {cartoon: {color: 'spectrum'}});
        viewer.setStyle({chain: 'B'}, {cartoon: {color: 'blue'}});
        viewer.setStyle({chain: 'C'}, {cartoon: {color: 'green'}});
        viewer.setStyle({chain: 'D'}, {cartoon: {color: 'magenta'}});
        
        viewer.zoomTo();
        viewer.render();
        
        // 프레젠테이션 동안 자동으로 빙글빙글 돌아가는 효과
        viewer.spin("y", 1); 
    });
}

// 마우스 휠로도 슬라이드 전환 가능하게 설정
window.addEventListener('wheel', (e) => {
    // 스크롤이 끝난 후 이벤트 발생을 위해 Debounce 적용
    if(this.animationTimer) return;
    this.animationTimer = setTimeout(() => {
        if (e.deltaY > 0) nextSlide();
        else prevSlide();
        this.animationTimer = null;
    }, 1000); // 1초 간격으로만 휠 인식 (모션이 겹치지 않게)
});

// 초기화
updateSlides();
