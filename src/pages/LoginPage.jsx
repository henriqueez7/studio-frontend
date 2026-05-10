import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiBaseUrl } from "../services/api.js";
import { getErrorMessage } from "../utils/errors.js";
import { AUTH_REDIRECT_KEY, getPrivatePath } from "../utils/auth.js";
import logo from "../assets/logo-optimized.png";
import styles from "./LoginPage.module.css";

const MotionDiv = motion.div;

const loginSchema = z.object({
  email: z.string().email("Insira um e-mail válido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submissionError, setSubmissionError] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("next");
  const oauthError = searchParams.get("oauthError");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmissionError("");
    try {
      const result = await login(data);
      navigate(redirectTo || getPrivatePath(result.user?.role), {
        replace: true,
      });
      return result;
    } catch (error) {
      setSubmissionError(
        getErrorMessage(error, "Erro ao autenticar. Verifique suas credenciais."),
      );
    }
  };

  const handleGoogleLogin = () => {
    if (redirectTo) {
      localStorage.setItem(AUTH_REDIRECT_KEY, redirectTo);
    } else {
      localStorage.removeItem(AUTH_REDIRECT_KEY);
    }

    window.location.assign(`${getApiBaseUrl()}/oauth2/authorization/google`);
  };

  return (
    <div className={`${styles.loginPage} ${styles.loginPageFixed}`}>
      <div className={styles.loginBackgroundGlow} />

      <div className={styles.loginGrid}>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={styles.loginCard}
        >
          <Link to="/" className={styles.loginBrand}>
            <img
              src={logo}
              alt="Studio Henrique Corte"
              className={styles.loginBrandImage}
              decoding="async"
              fetchPriority="high"
            />
          </Link>

          <div className={styles.loginCardHeader}>
            <p className={styles.loginCardEyebrow}>Studio Henrique Corte</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>E-mail</span>
              <input
                type="email"
                placeholder="seuemail@studio.com"
                {...register("email")}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>
                {errors.email?.message}
              </span>
            </label>

            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>Senha</span>
              <input
                type="password"
                placeholder="Digite sua senha"
                {...register("password")}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>
                {errors.password?.message}
              </span>
            </label>

            <AnimatePresence>
              {submissionError || oauthError ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={styles.loginError}
                >
                  {submissionError || "Não foi possível entrar com Google. Tente novamente."}
                </MotionDiv>
              ) : null}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.loginButton}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
              <ArrowRight className={styles.loginIcon} />
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className={styles.loginGoogleButton}
            >
              <span className={styles.loginGoogleIcon} aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.239 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.851 1.154 7.967 3.033l5.657-5.657C34.053 6.053 29.281 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.307 14.691 12.88 19.51C14.657 15.108 18.961 12 24 12c3.059 0 5.851 1.154 7.967 3.033l5.657-5.657C34.053 6.053 29.281 4 24 4c-7.682 0-14.414 4.337-17.693 10.691Z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.179 0 9.867-1.977 13.409-5.189l-6.19-5.238C29.147 35.091 26.715 36 24 36c-5.218 0-9.62-3.318-11.282-7.946l-6.524 5.025C9.434 39.556 16.227 44 24 44Z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.573l.003-.002 6.19 5.238C36.971 39.212 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
                  />
                </svg>
              </span>
              Entrar com Google
            </button>
          </form>

          <p className={styles.loginFooter}>
            Ainda não tem conta?{" "}
            <Link to="/register" className={styles.loginFooterLink}>
              Criar conta
            </Link>
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}
