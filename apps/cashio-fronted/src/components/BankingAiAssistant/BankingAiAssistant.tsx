import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services";
import { useMutation } from "@tanstack/react-query";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import styles from "./BankingAiAssistant.module.css";

type AiMessage = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export const BankingAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "שלום! אני העוזר הפיננסי המאובטח שלך. כיצד אוכל לסייע לך לבדוק את היסטוריית הפעולות או היתרה שלך היום?",
    },
  ]);

  const sendChatMessage = async (message: string) => {
    const response = await api.post("/chat", { message });
    return response.data.reply;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (aiReply) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: "ai", text: aiReply },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: "שגיאת חיבור. לא הצלחתי להתחבר לשרת הבנקאי.",
        },
      ]);
    },
  });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "user", text: userMessage },
    ]);
    setInputValue("");
    mutate(userMessage);
  };

  return (
    <>
      {/* Floating Trigger Circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.chatTrigger}
        title="צ'אט עם העוזר הפיננסי"
        aria-label="Toggle AI Assistant Chat"
      >
        <FaRobot />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatarWrapper}>
                <FaRobot />
                <span className={styles.onlineIndicator} />
              </div>
              <div className={styles.headerText}>
                <h3>עוזר פיננסי AI</h3>
                <span>מחובר • מאובטח</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              title="סגור"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.sender === "user" ? styles.userRow : styles.aiRow
                }`}
              >
                <div
                  className={`${styles.messageBubble} ${
                    msg.sender === "user" ? styles.userBubble : styles.aiBubble
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Bouncing Typing Indicator */}
            {isPending && (
              <div className={`${styles.messageRow} ${styles.typingRow}`}>
                <div className={styles.typingBubble}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className={styles.inputForm}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="הקלד הודעה כאן..."
                className={styles.inputField}
                disabled={isPending}
              />
            </div>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isPending}
              title="שלח"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
