import React, { useEffect, useState } from "react";
import "./styles/Usage.css";
import { useHeaderStore } from "../store/headerStore";
import Header from "../components/Header";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

export default function Usage() {
  const setHeaderVersion = useHeaderStore((state) => state.setHeaderVersion);
  const [showResult, setShowResult] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");

  useEffect(() => {
    setHeaderVersion("black");
  }, [setHeaderVersion]);

  const handleSend = () => {
    const inputValue = document.querySelector(".chat-input")?.value;
    if (inputValue) {
      setUserQuestion(inputValue);
    } else {
      setUserQuestion("화이트 계열의 PC를 맞추고 싶어요!");
    }
    setShowResult(true);
  };

  const handleBack = () => {
    setShowResult(false);
    setUserQuestion("");
  };

  return (
    <div className="usage-page">
      {!showResult ? (
        <Header />
      ) : (
        <div className="custom-header">
          <IconButton onClick={handleBack} className="back-btn">
            <ArrowBackIcon />
          </IconButton>
          <h3>{userQuestion}</h3>
        </div>
      )}

      <main className="usage-main">
        {!showResult ? (
          <>
            <h2 className="usage-title">
              당신만을 위한 맞춤형 PC 견적 AI,{" "}
              <span className="highlight">스펙메이트</span>
            </h2>

            <div className="usage-character">
              <img src="/character.svg" alt="스펙메이트 캐릭터" />
            </div>

            <div className="question-list">
              <div className="question-row">
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion("화이트 계열의 PC를 맞추고 싶어요!");
                    setShowResult(true);
                  }}
                >
                  화이트 계열의 PC를 맞추고 싶어요!
                </button>
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "인공지능 모델을 학습시키고 사용할 수 있는 PC 견적을 작성해주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  인공지능 모델을 학습시키고 사용할 수 있는 PC 견적을
                  작성해주세요.
                </button>
              </div>
              <div className="question-row">
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "예산 300만원 안에서 게임용 PC 5대 추천해주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  예산 300만원 안에서 게임용 PC 5대 추천해주세요.
                </button>
                <button
                  className="question-btn"
                  onClick={() => {
                    setUserQuestion(
                      "RTX 5060Ti가 들어간 120만원 PC 견적을 맞춰주세요."
                    );
                    setShowResult(true);
                  }}
                >
                  RTX 5060Ti가 들어간 120만원 PC 견적을 맞춰주세요.
                </button>
              </div>
            </div>

            <div className="input-section">
              <input
                type="text"
                placeholder="어떻게 견적을 짜드릴까요? 스펙메이트에게 물어보세요!"
                className="chat-input"
              />
              <IconButton className="send-btn" onClick={handleSend}>
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        ) : (
          <>
            {/* 결과 화면 */}
            <div className="result-container">
              <div className="chat-box">
                <div className="chat-message">
                  <strong className="ai-name">스펙메이트</strong>
                  <p>{userQuestion}에 대한 결과입니다.</p>
                </div>

                <div className="part-list">
                  <h4>1. 케이스</h4>
                  <p>
                    <b>darkFlash DS900 ARGB 강화유리 (화이트)</b>
                    <br />
                    화이트 감성을 살리기에 적합한 케이스로, 내부 구조가 보기
                    쉽고 강화유리를 사용하여 튜닝 효과를 극대화할 수 있습니다.
                  </p>

                  <h4>2. 그래픽카드(GPU)</h4>
                  <p>
                    <b>
                      이엠텍 지포스 RTX 4070 SUPER MIRACLE X3 WHITE D6X 12GB
                    </b>
                    <br />
                    최신 RTX 시리즈로, 게임 및 작업용으로도 우수한 성능을
                    제공합니다.
                  </p>

                  <h4>3. 메모리(RAM)</h4>
                  <p>
                    <b>TeamGroup DDR5-5600 CL46 Elite 시리즈 (16GB × 2)</b>
                    <br />
                    화이트 컬러의 DDR5 메모리로, 높은 성능과 함께 조화로운
                    디자인을 자랑합니다.
                  </p>
                </div>
              </div>

              <div className="status-box">
                <h4>상태</h4>
                <ul>
                  <li>
                    <RadioButtonUncheckedIcon /> 화이트 계열의 부품들을 찾고
                    있어요.
                  </li>
                  <li>
                    <RadioButtonUncheckedIcon /> 저렴한 부품들로 PC를 구성하고
                    있어요.
                  </li>
                  <li>
                    <CheckCircleIcon color="primary" /> 화이트 계열의 부품들을
                    찾고 있어요.
                  </li>
                  <li>
                    <CheckCircleIcon color="primary" /> 화이트 계열 부품들로 PC
                    견적을 준비했어요.
                  </li>
                  <li>
                    <CheckCircleIcon color="primary" /> 나만의 PC 견적 보관함에
                    부품들을 저장했어요.
                  </li>
                </ul>
              </div>
            </div>

            <div className="input-section">
              <input
                type="text"
                placeholder="원하는 견적을 입력해보세요!"
                className="chat-input"
              />
              <IconButton className="send-btn" onClick={handleSend}>
                <SendIcon style={{ transform: "rotate(-45deg)" }} />
              </IconButton>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
