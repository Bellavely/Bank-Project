import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AuthInput } from "../input";
import { TbLock, TbMail, TbUser, TbPhone } from "react-icons/tb";
import { AuthButton } from "../button";
import styles from "./register.module.css";
import { api } from "../../services";
import { useLanguage } from "../../hooks";

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
  const { translate } = useLanguage();
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
      newErrors.email = translate("register.emailError");
    }
    if (userData.fullname.trim() === "") {
      newErrors.fullname = translate("register.fullNameError");
    }
    if (userData.password.trim() === "") {
      newErrors.password = translate("register.passwordError");
    }
    if (userData.validatePassword.trim() === "") {
      newErrors.validatePassword = translate("register.passwordError");
    }
    if (userData.validatePassword !== userData.password) {
      newErrors.validatePassword = `${newErrors.validatePassword} ${translate("register.confirmPasswordError")}`;
    }
    const phoneRestRegex = /^\d{7}$/;
    if (
      userData.phonePrefix.trim() === "" ||
      !phoneRestRegex.test(userData.phoneNum)
    ) {
      newErrors.phone = translate("register.phoneError");
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
            <h3>{translate("register.otpHeader")}</h3>
            <p>{translate("register.otpMessage")} {userEmail}</p>
          </div>
          <AuthInput
            value={otp}
            Icon={TbLock}
            placeholder={translate("register.otpPlaceholder")}
            onChange={(value) => setOtp(value)}
          />
          {registerStatus && (
            <div className={styles["status-msg"]}>{registerStatus}</div>
          )}
        </div>
        <AuthButton title={translate("register.otpHeader")} onClick={handleVerifyOtp} />
        <button
          className={styles["resend-btn"]}
          onClick={handleResendOtp}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `${translate("register.resendCooldown")}(${resendCooldown}s)`
            : `${translate("register.resendOtp")}`}
        </button>
      </div>
    );
  }

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-form"]}>
        <AuthInput
          Icon={TbUser}
          placeholder={translate("register.fullName")}
          onChange={(value) => onChangeValue("fullname", value)}
          error={errors.fullname}
        />
        <AuthInput
          Icon={TbMail}
          placeholder={translate("register.email")}
          onChange={(value) => onChangeValue("email", value)}
          error={errors.email}
        />
        <AuthInput
          Icon={TbLock}
          isPassword
          placeholder={translate("register.password")}
          onChange={(value) => onChangeValue("password", value)}
          error={errors.password}
        />
        <AuthInput
          isPassword
          Icon={TbLock}
          placeholder={translate("register.confirmPassword")}
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
                <option value="">{translate("register.phonePrefix")}</option>
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
              placeholder={translate("register.phone")}
              onChange={(e) => onChangeValue("phoneNum", e.target.value)}
            />
          </div>
          {errors.phone && (
            <span className={styles["error-text"]}>{errors.phone}</span>
          )}
        </div>
      </div>
      <AuthButton
        title={translate("register.registerBtn")}
        onClick={() => handleSubmit()}
      />
    </div>
  );
};
