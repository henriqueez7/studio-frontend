import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiBaseUrl } from "../services/api.js";
import { getErrorMessage } from "../utils/errors.js";
import { AUTH_REDIRECT_KEY, getPrivatePath } from "../utils/auth.js";
import { isValidPhoneNumber, normalizeEmail, normalizePhone } from "../utils/contactValidation.js";
import logo from "../assets/logo-optimized.png";
import styles from "./LoginPage.module.css";

const MotionDiv = motion.div;

const registerSchema = z
  .object({
    name: z.string().min(3, "Informe seu nome completo"),
    email: z.string().email("Insira um e-mail valido"),
    password: z.string().min(6, "Senha minima de 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
    phone: z
      .string()
      .max(20, "Use no maximo 20 caracteres")
      .optional()
      .refine((value) => !value || isValidPhoneNumber(value), "Informe um telefone valido com DDD."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submissionError, setSubmissionError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmissionError("");

    try {
      const result = await registerUser({
        name: data.name,
        email: normalizeEmail(data.email),
        password: data.password,
        phone: normalizePhone(data.phone) || undefined,
      });

      navigate(getPrivatePath(result.user?.role), { replace: true });
    } catch (error) {
      setSubmissionError(
        getErrorMessage(error, "Erro ao concluir cadastro. Tente novamente."),
      );
    }
  };

  const handleGoogleLogin = () => {
    localStorage.setItem(AUTH_REDIRECT_KEY, "/agendar");
    window.location.assign(`${getApiBaseUrl()}/oauth2/authorization/google`);
  };

  return (
    <div className={styles.loginPage}>
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
            <h1 className={styles.loginCardTitle}>Criar conta</h1>
            <p className={styles.loginCardSubtitle}>
              Cadastre-se para entrar no fluxo de agendamento do studio.
            </p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>Nome</span>
              <input
                type="text"
                placeholder="Seu nome"
                {...register("name")}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>{errors.name?.message}</span>
            </label>

            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>E-mail</span>
              <input
                type="email"
                placeholder="seuemail@studio.com"
                {...register("email", {
                  onChange: (event) => {
                    event.target.value = normalizeEmail(event.target.value);
                  },
                })}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>{errors.email?.message}</span>
            </label>

            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>Senha</span>
              <input
                type="password"
                placeholder="Digite sua senha"
                {...register("password")}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>{errors.password?.message}</span>
            </label>

            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>Confirmar senha</span>
              <input
                type="password"
                placeholder="Repita sua senha"
                {...register("confirmPassword")}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldError}>
                {errors.confirmPassword?.message}
              </span>
            </label>

            <label className={styles.loginField}>
              <span className={styles.loginFieldLabel}>WhatsApp (opcional)</span>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                {...register("phone", {
                  onChange: (event) => {
                    event.target.value = normalizePhone(event.target.value);
                  },
                })}
                className={styles.loginInput}
              />
              <span className={styles.loginFieldHint}>
                Se informar um numero, o studio podera enviar confirmacoes automaticas.
              </span>
              <span className={styles.loginFieldError}>{errors.phone?.message}</span>
            </label>

            <AnimatePresence>
              {submissionError ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className={styles.loginError}
                >
                  {submissionError}
                </MotionDiv>
              ) : null}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.loginButton}
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
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
              Continuar com Google
            </button>
          </form>

          <p className={styles.loginFooter}>
            Ja tem conta?{" "}
            <Link to="/login" className={styles.loginFooterLink}>
              Entrar
            </Link>
          </p>
        </MotionDiv>
      </div>
    </div>
  );
}
