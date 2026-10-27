#pragma once
#include <cstdint>

// Project: Interface Project
// Field offsets in ICD use packed lengths; C++ layout may include padding.

// 공통 메시지 헤더
struct MessageHeader
{
    std::uint16_t messageId; // 최소값: 0, 최대값: 65535, 설명: 메시지 식별자
    std::uint32_t sequence; // 최소값: 0, 최대값: 4294967295, 설명: 메시지 순서 번호
    std::uint16_t payloadLength; // 최소값: 0, 최대값: 65535, 설명: 본문 데이터 길이
    std::uint64_t timestamp; // 최소값: 0, 최대값: , 설명: 메시지 생성 시각
    std::uint8_t version; // 최소값: 0, 최대값: 255, 설명: 인터페이스 버전
};

// 일반 상태 데이터 예제
struct StatusData
{
    MessageHeader header; // 최소값: , 최대값: , 설명: 공통 메시지 헤더
    std::uint8_t statusCode; // 최소값: 0, 최대값: 255, 설명: 상태 코드
    float temperature; // 최소값: -40, 최대값: 125, 설명: 온도
    bool enabled; // 최소값: 0, 최대값: 1, 설명: 활성 상태
};

// End of Interface Project
