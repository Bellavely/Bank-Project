import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AuthInput } from "../input";
import { TbLock, TbMail, TbUser, TbPhone } from "react-icons/tb";
import { AuthButton } from "../button";
import styles from "./register.module.css";
import { api } from "../../services";

type User = {
  fullname: string;
  email: string;
  password: string;
  validatePassword: string;
  phone: string;
};

export const Register = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    validatePassword: "",
    phonePrefix: "",
    phoneNum: "",
  });

  const [errors, setErrors] = useState<User>({
    fullname: "",
    email: "",
    password: "",
    validatePassword: "",
    phone: "",
  });

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onChangeValue = (valueName: string, input: string) => {
    setUserData((prev) => ({ ...prev, [valueName]: input }));
  };

  const validateData = () => {
    const newErrors: User = {
      fullname: "",
      email: "",
      password: "",
      validatePassword: "",
      phone: "",
    };

    if (userData.email.trim() === "" || !userData.email.includes("@")) {
      newErrors.email = "מייל לא תקין";
    }
    if (userData.fullname.trim() === "") {
      newErrors.fullname = "שם מלא לא יכול להיות ריק";
    }
    if (userData.password.trim() === "") {
      newErrors.password = "אנא רשום סיסמה";
    }
    if (userData.validatePassword.trim() === "") {
      newErrors.validatePassword = "אנא וודא את הסיסמה שרשמת";
    }
    if (userData.validatePassword !== userData.password) {
      newErrors.validatePassword = `${newErrors.validatePassword} אנא וודא שהסיסמאות דומות `;
    }
    const phoneRestRegex = /^\d{7}$/;
    if (
      userData.phonePrefix.trim() === "" ||
      !phoneRestRegex.test(userData.phoneNum)
    ) {
      newErrors.phone = "מספר טלפון לא תקין";
    }

    setErrors(newErrors);
    return (
      !newErrors.email &&
      !newErrors.fullname &&
      !newErrors.password &&
      !newErrors.validatePassword &&
      !newErrors.phone
    );
  };

  const handleSubmit = async () => {
    if (validateData()) {
      try {
        await api.post("/auth/register", {
          email: userData.email,
          password: userData.password,
          validatePassword: userData.validatePassword,
          phone: `${userData.phonePrefix}${userData.phoneNum}`,
          fullname: userData.fullname,
        });
        setUserEmail(userData.email);
        setOtp("");
        setIsVerifying(true);
        startCooldown();
      } catch (err) {
        console.error("Registration failed:", err);
      }
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/auth/verifyOTP", {
        email: userEmail,
        userOTP: otp,
      });

      const token = res.data;
      localStorage.setItem("token", token);

      setRegisterStatus("חשבון אומת בהצלחה! מתחבר...");
      navigate("/app/dashboard");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setRegisterStatus("קוד אימות שגוי, אנא נסה שנית.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post("/auth/resendOTP", { email: userEmail });
      setRegisterStatus("קוד אימות חדש נשלח למייל שלך.");
      startCooldown();
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setRegisterStatus("שליחת קוד נכשלה, נסה שנית מאוחר יותר.");
    }
  };

  if (isVerifying) {
    return (
      <div className={styles["register-container"]}>
        <div className={styles["register-form"]}>
          <div className={styles["otp-header"]}>
            <h3>אימות חשבון</h3>
            <p>שלחנו קוד אימות לכתובת {userEmail}</p>
          </div>
          <AuthInput
          value = ''
            Icon={TbLock}
            placeholder="הזן קוד (6 ספרות)"
            onChange={(value) => setOtp(value)}
          />
          {registerStatus && (
            <div className={styles["status-msg"]}>{registerStatus}</div>
          )}
        </div>
        <AuthButton title="אמת חשבון" onClick={handleVerifyOtp} />
        <button
          className={styles["resend-btn"]}
          onClick={handleResendOtp}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `שלח קוד מחדש (${resendCooldown}s)`
            : "שלח קוד מחדש"}
        </button>
        <button
          className={styles["back-btn"]}
          onClick={() => setIsVerifying(false)}
        >
          חזור לפרטי הרשמה
        </button>
      </div>
    );
  }

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-form"]}>
        <AuthInput
          Icon={TbUser}
          placeholder="שם מלא"
          onChange={(value) => onChangeValue("fullname", value)}
          error={errors.fullname}
        />
        <AuthInput
          Icon={TbMail}
          placeholder="כתובת אימייל"
          onChange={(value) => onChangeValue("email", value)}
          error={errors.email}
        />
        <AuthInput
          Icon={TbLock}
          isPassword
          placeholder="סיסמה"
          onChange={(value) => onChangeValue("password", value)}
          error={errors.password}
        />
        <AuthInput
          isPassword
          Icon={TbLock}
          placeholder="אימות סיסמה"
          onChange={(value) => onChangeValue("validatePassword", value)}
          error={errors.validatePassword}
        />
        <div className={styles["phone-group-wrapper"]}>
          <div className={styles["phone-group"]}>
            <div className={styles["select-wrapper"]}>
              <TbPhone className={styles["phone-icon"]} />
              <select
                className={styles["register-select"]}
                onChange={(e) => onChangeValue("phonePrefix", e.target.value)}
              >
                <option value="">בחר</option>
                <option value="050">050</option>
                <option value="052">052</option>
                <option value="053">053</option>
                <option value="054">054</option>
                <option value="055">055</option>
                <option value="058">058</option>
              </select>
            </div>
            <input
              className={styles["phone-input"]}
              placeholder="מספר טלפון (7 ספרות)"
              onChange={(e) => onChangeValue("phoneNum", e.target.value)}
            />
          </div>
          {errors.phone && (
            <span className={styles["error-text"]}>{errors.phone}</span>
          )}
        </div>
      </div>
      <AuthButton title="צור חשבון חדש" onClick={() => handleSubmit()} />
    </div>
  );
};
