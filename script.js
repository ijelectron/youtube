// script.js

// API 키 설정
const API_KEY = 'AIzaSyAGFU9Gpn4bG4PK4NuZrQONvbNQjshvFiE';

// 구글 번역 API 엔드포인트
const TRANSLATE_ENDPOINT = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

// 언어 감지 API 엔드포인트
const DETECT_LANGUAGE_ENDPOINT = `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`;

// 유튜브 검색 API 엔드포인트
const YOUTUBE_SEARCH_ENDPOINT = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=8`; // maxResults=24으로 변경

// 유튜브 채널 통계 API 엔드포인트
const YOUTUBE_CHANNEL_ENDPOINT = `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&part=statistics`;

// 유튜브 비디오 통계 API 엔드포인트
const YOUTUBE_VIDEO_STATS_ENDPOINT = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&part=statistics`;

// 초기 정렬 기준을 'views'로 설정
let currentSortOption = 'views';

// 24개의 이미지 파일 경로 리스트
const imageFiles = [
    'image/ad_1.png', 'image/ad_2.png', 'image/ad_3.png', 'image/ad_4.png', 
    'image/ad_5.png', 'image/ad_6.png', 'image/ad_7.png', 'image/ad_8.png',
    'image/ad_9.png', 'image/ad_10.png', 'image/ad_11.png', 'image/ad_12.png',
    'image/ad_13.png', 'image/ad_14.png', 'image/ad_15.png', 'image/ad_16.png',
    'image/ad_17.png', 'image/ad_18.png', 'image/ad_19.png', 'image/ad_20.png',
    'image/ad_21.png', 'image/ad_22.png', 'image/ad_23.png', 'image/ad_24.png'
];

// 번역 및 유튜브 검색을 처리하는 함수
async function translateAndSearch(targetLang) {
    const query = document.getElementById('search-input').value;  // 검색창에서 입력된 값을 가져옴
    const detectedLang = await detectLanguage(query);  // 입력된 텍스트의 언어를 감지
    const translatedText = await translateText(query, targetLang);  // 입력된 텍스트를 목표 언어로 번역
    searchYouTube(translatedText, targetLang);  // 번역된 텍스트로 유튜브 검색 수행, targetLang을 전달
}

// 입력된 텍스트의 언어를 감지하는 함수
async function detectLanguage(text) {
    const response = await fetch(`${DETECT_LANGUAGE_ENDPOINT}&q=${encodeURIComponent(text)}`);  // 언어 감지 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    return data.data.detections[0][0].language;  // 감지된 언어 반환
}

// 구글 번역 API를 사용하여 텍스트를 번역하는 함수
async function translateText(query, targetLang) {
    const response = await fetch(`${TRANSLATE_ENDPOINT}&q=${encodeURIComponent(query)}&target=${targetLang}`);  // 번역 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    return data.data.translations[0].translatedText;  // 번역된 텍스트 반환
}

// 유튜브 데이터 API를 사용하여 유튜브 검색을 수행하는 함수
async function searchYouTube(query, targetLang) {
    const response = await fetch(`${YOUTUBE_SEARCH_ENDPOINT}&q=${encodeURIComponent(query)}`);  // 유튜브 검색 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    displayVideos(data.items, targetLang);  // 검색된 비디오 목록을 표시
}

// 채널의 구독자 수를 가져오는 함수
async function getChannelDetails(channelId) {
    const response = await fetch(`${YOUTUBE_CHANNEL_ENDPOINT}&id=${channelId}`);  // 채널 통계 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    return data.items[0].statistics.subscriberCount;  // 구독자 수 반환
}

// 비디오의 조회 수를 가져오는 함수
async function getVideoDetails(videoId) {
    const response = await fetch(`${YOUTUBE_VIDEO_STATS_ENDPOINT}&id=${videoId}`);  // 비디오 통계 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    return data.items[0].statistics.viewCount;  // 조회 수 반환
}

// 구글 번역 API를 사용하여 비디오 세부 정보를 번역하는 함수
async function translateVideoDetails(details, targetLang) {
    const response = await fetch(`${TRANSLATE_ENDPOINT}&q=${encodeURIComponent(details)}&target=${targetLang}`);  // 비디오 세부 정보 번역 API 호출
    const data = await response.json();  // JSON 형식으로 응답 데이터 받기
    return data.data.translations[0].translatedText;  // 번역된 텍스트 반환
}

// 구독자 수와 조회수를 포맷하는 함수
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 날짜를 'YYYY-MM-DD' 형식으로 변환하는 함수
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 비디오 다운로드 요청을 보내는 함수
async function downloadVideo(url) {
    const requestData = {
        url: url,
        type: 'video+audio'
    };

    try {
        const response = await fetch('http://192.168.1.120:5003/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Video Download Response:', data);
        } else {
            console.error('Video Download Error:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function downloadAudio(url) {
    const requestData = {
        url: url,
        type: 'audio'
    };

    try {
        const response = await fetch('http://192.168.1.120:5003/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Audio Download Response:', data);
        } else {
            console.error('Audio Download Error:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 비디오 목록과 그 세부 정보를 표시하는 함수
async function displayVideos(videos, targetLang) {
    const container = document.getElementById('video-container');
    container.innerHTML = '';  // 기존 비디오 목록 초기화

    // 비디오 목록을 최대 24개로 제한
    const limitedVideos = videos.slice(0, 8);

    // 비디오의 조회수와 구독자 수 가져오기
    const videosWithDetails = await Promise.all(limitedVideos.map(async video => {
        const videoId = video.id.videoId;
        const channelId = video.snippet.channelId;
        const viewCount = await getVideoDetails(videoId);
        const subscriberCount = await getChannelDetails(channelId);
        const date = new Date(video.snippet.publishedAt);
        return { ...video, viewCount: parseInt(viewCount), subscriberCount: parseInt(subscriberCount), date };
    }));

    // 정렬 기준에 따라 비디오 목록 정렬
    videosWithDetails.sort((a, b) => {
        if (currentSortOption === 'views') {
            return b.viewCount - a.viewCount;
        } else if (currentSortOption === 'subscribers') {
            return b.subscriberCount - a.subscriberCount;
        } else if (currentSortOption === 'new') {
            return b.date - a.date;
        }
    });

    // 각 비디오에 이미지를 삽입
    for (let i = 0; i < videosWithDetails.length; i++) {
        const video = videosWithDetails[i];
        const videoId = video.id.videoId;

        const videoElement = document.createElement('iframe');  // 비디오 iframe 요소 생성
        videoElement.src = `https://www.youtube.com/embed/${videoId}`;
        videoElement.width = '100%';
        videoElement.height = '315';
        videoElement.frameBorder = '0';
        videoElement.allow = 'autoplay; encrypted-media';
        videoElement.allowFullscreen = true;

        const originalTitle = video.snippet.title;

        const title = document.createElement('h3');  // 제목 요소 생성
        title.textContent = originalTitle;  // 원래 제목 사용
        title.setAttribute('data-original-title', originalTitle);  // 원래 제목을 데이터 속성에 저장
        title.setAttribute('data-translated-title', '');  // 번역된 제목을 저장할 데이터 속성 초기화

        const description = document.createElement('p');  // 설명 요소 생성

        const videoInfo = document.createElement('div');  // 비디오 정보 요소 생성
        videoInfo.classList.add('video-info');
        videoInfo.innerHTML = `
            <strong>Date</strong> ${formatDate(video.snippet.publishedAt)}<br>
            <strong>Subscribers</strong> ${formatNumber(video.subscriberCount)}<br>
            <strong>Views</strong> ${formatNumber(video.viewCount)}
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('video-buttons');

        const button1 = document.createElement('button');
        button1.classList.add('video-button');
        button1.addEventListener('click', () => downloadVideo(`https://www.youtube.com/watch?v=${videoId}`)); // button1 클릭 이벤트 추가

        const button2 = document.createElement('button');
        button2.classList.add('audio-button');
        button2.addEventListener('click', () => downloadAudio(`https://www.youtube.com/watch?v=${videoId}`)); // button2 클릭 이벤트 추가

        buttonContainer.appendChild(button1);
        buttonContainer.appendChild(button2);

        const videoEntry = document.createElement('div');  // 비디오 항목 요소 생성
        videoEntry.classList.add('video-entry');

        videoEntry.appendChild(videoElement);  // 비디오 요소 추가
        videoEntry.appendChild(title);  // 제목 요소 추가
        videoEntry.appendChild(description);  // 설명 요소 추가
        videoEntry.appendChild(videoInfo);  // 비디오 정보 요소 추가
        videoEntry.appendChild(buttonContainer);  // 버튼 컨테이너 추가

        const slideButtonContainer = document.createElement('div');
        slideButtonContainer.classList.add('slide-button-container');

        const slideButtonText = document.createElement('span');

        const slideButton = document.createElement('label');
        slideButton.classList.add('slide-button');

        const slideInput = document.createElement('input');
        slideInput.type = 'checkbox';

        slideInput.addEventListener('change', async () => {
            const query = document.getElementById('search-input').value;
            const detectedLang = await detectLanguage(query);

            if (slideInput.checked) {
                const translatedTitle = await translateText(originalTitle, detectedLang);
                title.textContent = translatedTitle;
                title.setAttribute('data-translated-title', translatedTitle);
            } else {
                title.textContent = title.getAttribute('data-original-title');
            }
        });

        const slider = document.createElement('span');
        slider.classList.add('slider');

        slideButton.appendChild(slideInput);
        slideButton.appendChild(slider);

        slideButtonContainer.appendChild(slideButtonText);
        slideButtonContainer.appendChild(slideButton);

        videoEntry.appendChild(slideButtonContainer); // 슬라이드 버튼 컨테이너를 비디오 항목에 추가

        // 이미지 요소 생성 및 추가
        const imageElement = document.createElement('img');
        imageElement.src = imageFiles[i];  // 정렬된 순서에 따라 이미지 파일 경로 설정
        imageElement.alt = 'Banner Ads : ijelectron316@naver.com';
        imageElement.classList.add('video-image');
        videoEntry.appendChild(imageElement);  // 이미지 요소를 비디오 항목에 추가

        container.appendChild(videoEntry);  // 비디오 항목을 컨테이너에 추가

        buttonContainer.style.display = 'flex';
    }
}

// 라디오 버튼의 선택에 따라 정렬 기준을 변경하는 이벤트 리스너 추가
document.querySelectorAll('input[name="options"]').forEach(radio => {
    radio.addEventListener('change', () => {
        currentSortOption = radio.value;  // 선택된 값으로 정렬 기준 변경
        const query = document.getElementById('search-input').value;  // 검색창에서 입력된 값을 가져옴
        translateAndSearch(query);  // 변경된 정렬 기준으로 다시 검색 수행
    });
});

// 초기 검색 수행
translateAndSearch(document.getElementById('search-input').value);
