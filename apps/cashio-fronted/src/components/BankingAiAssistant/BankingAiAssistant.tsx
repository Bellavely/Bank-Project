import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services";
import { useMutation } from "@tanstack/react-query";
import { FaRobot, FaTimes, FaPaperPlane } from "react-icons/fa";
import styles from "./BankingAiAssistant.module.css";
import { useLanguage } from "../../hooks";

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
  const { translate, lang } = useLanguage();

  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: translate("ai.welcomeMessage"),
    },
  ]);

  const sendChatMessage = async (message: string) => {
    const response = await api.post("/chat", {
      message,
      currentLanguage: lang,
    });
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
          text: translate("ai.errorMessage"),
        },
      ]);
    },
  });

  const translateHistoryApi = async (targetLang: string) => {
    const response = await api.post("/chat/translate", {
      messages: messages.map((m) => ({ role: m.sender, content: m.text })),
      currentLanguage: targetLang,
    });
    return response.data.messages;
  };

  const { mutate: translateHistory, isPending: isTranslating } = useMutation({
    mutationFn: translateHistoryApi,
    onSuccess: (translatedMessages: { role: string; content: string }[]) => {
      setMessages((prev) =>
        prev.map((msg, index) => {
          if (msg.id === "welcome") {
            return { ...msg, text: translate("ai.welcomeMessage") };
          }
          return {
            ...msg,
            text: translatedMessages[index]?.content || msg.text,
          };
        }),
      );
    },
  });

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "welcome"
          ? { ...msg, text: translate("ai.welcomeMessage") }
          : msg,
      ),
    );

    if (messages.length > 1) {
      translateHistory(lang);
    }
  }, [lang]);

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.chatTrigger}
        title={translate("ai.agentTooltip")}
        aria-label="Toggle AI Assistant Chat"
      >
        <FaRobot />
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatarWrapper}>
                <FaRobot />
                <span className={styles.onlineIndicator} />
              </div>
              <div className={styles.headerText}>
                <h3>{translate("ai.welcomeTitle")}</h3>
                <span> {translate("ai.onlineIndicator")}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              title={translate("ai.closeButton")}
            >
              <FaTimes />
            </button>
          </div>

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

          <form onSubmit={handleSend} className={styles.inputForm}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={translate("ai.enterMessagePlaceholder")}
                className={styles.inputField}
                disabled={isPending}
              />
            </div>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || isPending}
              title={translate("ai.send")}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
