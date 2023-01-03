import { useEffect, useRef, useState } from "react";
import FormInput from "../Form/FormInput";
import GoogleLoginButton from "../GoogleLoginButton";
import BaseModal from "../Modals/BaseModal";
import Button from "../Form/Button";
import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import { AuthActions } from "~/redux/auth";
import { useDispatch, useSelector } from "react-redux";
import icons from "~/config/themes/icons";
import { getCurrentUser } from "~/config/utils/getCurrentUser";
import { StyleSheet, css } from "aphrodite";
import Loader from "~/components/Loader/Loader";
import IconButton from "../Icons/IconButton";
import colors from "~/config/themes/colors";
import { isValidEmail } from "~/config/utils/validation";
import { sendAmpEvent } from "~/config/fetch";
import { useRouter } from "next/router";
import { breakpoints } from "~/config/themes/screen";
import { ModalActions } from "~/redux/modals";
import { connect } from "react-redux";
import { MessageActions } from "~/redux/message";

type SCREEN = "SELECT_PROVIDER" | "LOGIN_WITH_EMAIL_FORM" | "SIGNUP_FORM" | "VERIFY_EMAIL" | "FORGOT_PASSWORD" | "FORGOT_PASSWORD_EMAIL_SENT";

const LoginModal = ({ isOpen, handleClose, setMessage, showMessage, loginCallback, modals }) => {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const dispatch = useDispatch();
  // @ts-ignore
  const auth = useSelector((state) => state.auth)
  const [step, setStep] = useState<SCREEN>("SELECT_PROVIDER");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<Boolean|String>(false);
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState<Boolean|String>(false);
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState<Boolean|String>(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<Boolean|String>(false);
  const [miscError, setMiscError] = useState<Boolean|String>(false);
  const [isLoading, setIsLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>();

  const _handleClose = () => {
    handleClose && handleClose();
    reset();
    dispatch(ModalActions.openLoginModal(false))
  }

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen])

  const checkIfAccountExistsApi = async (e) => {
    e?.preventDefault();
    resetErrors();

    if (isValidEmail(email)) {
      setIsLoading(true);
      return fetch(API.CHECK_ACCOUNT(), API.POST_CONFIG({ email }))
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((data:any) => {

          if (data.exists) {
            if (data.auth === "google") {
              setMiscError("Account already exists. Please login with Google.");
            }
            else if (data.auth === "email") {
              if (data.is_verified) {
                setStep("LOGIN_WITH_EMAIL_FORM");        
              }
              else {
                setMiscError("Account not yet verified. Click on the verification link sent to your email.");
              }
            }
            else {
              setMiscError("Something went wrong. Please try again later.");
            }
          }
          else {
            setStep("SIGNUP_FORM");
          }
        })
        .catch((error) => {
          setMessage("Unexpected error");
          showMessage({ show: true, error: true });
        })
        .finally(() => {
          // resetErrors();
          setIsLoading(false);
        })
    }
    else {
      setEmailError("Enter a valid email")
    }
  };

  const loginApi = async (e) => {
    e?.preventDefault();

    if (password.length === 0) {
      setPasswordError("Enter a password");
      return;
    }
    else {
      setPasswordError(false);
    }

    setIsLoading(true);
    const response:any = await dispatch(AuthActions.loginWithEmail({ email, password }));

    if (response.loginFailed) {
      setMiscError(response.loginErrorMsg);
    }
    else {
      // @ts-ignore
      dispatch(AuthActions.getUser()).then((userAction) => {

        if (loginCallback) {
          return loginCallback();
        }

        if (!userAction?.user?.has_seen_orcid_connect_modal) {
          let payload = {
            event_type: "user_signup",
            time: +new Date(),
            user_id: userAction.user.id,
            insert_id: `user_${userAction.user.id}`,
            event_properties: {
              interaction: "User Signup",
            },
          };
          sendAmpEvent(payload);

          router.push(
            "/user/[authorId]/onboard?internal=true",
            `/user/${userAction.user.author_profile.id}/onboard`
          );
        }

        _handleClose();
      })
    }

    setIsLoading(false);
  };

  const resetPasswordApi = async (e) => {
    e?.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email");
      return;
    }

    setIsLoading(true);

    return fetch(API.RESET_PASSWORD(), API.POST_CONFIG({ email }))
      .then(Helpers.checkStatus)
      .then(Helpers.parseJSON)
      .then((data:any) => {
        setStep("FORGOT_PASSWORD_EMAIL_SENT");
      })
      .catch((error) => {
        setMiscError("Something went wrong. Try again later.");
      })
      .finally(() => {
        resetErrors();
        setIsLoading(false);
      })
  }

  const resetErrors = () => {
    setMiscError(false);
    setEmailError(false);
    setFirstNameError(false);
    setLastNameError(false);
    setPasswordError(false);
  }

  const reset = () => {
    resetErrors();
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setIsLoading(false);
    setStep("SELECT_PROVIDER");
  }

  const createAccountApi = async(e) => {
    e?.preventDefault();

    let hasErrors = false;
    if (firstName.length === 0) {
      hasErrors = true;
      setFirstNameError("First name cannot be empty");
    }
    if (lastName.length === 0) {
      hasErrors = true;
      setLastNameError("Last name cannot be empty");
    }
    if (password.length < 9) {
      hasErrors = true;
      setPasswordError("Password must be at least 9 characters long");
    }

    if (!hasErrors) {
      setIsLoading(true);
      fetch(API.CREATE_ACCOUNT(), API.POST_CONFIG({ email, password1: password, password2: password, first_name: firstName, last_name: lastName }))
        .then(async (response) => {
          const data = await response.json();
          if (response.ok) {
            setStep("VERIFY_EMAIL");
          }
          else {
            const errorMsg = Object.values(data)?.[0]?.[0];
            if (errorMsg) {
              setMiscError(errorMsg);
            }
            else {
              setMiscError("Something went wrong. Please try again later.");
            }
          }
        })
        .catch((error) => {
          setMiscError("Something went wrong. Please try again later.")
        })
        .finally(() => {
          resetErrors();
          setIsLoading(false);
        })
    }    
  }

  return (
    <BaseModal
      closeModal={_handleClose}
      isOpen={isOpen}
      hideClose={true}
      titleStyle={styles.modalTitleStyleOverride}
      modalContentStyle={styles.modalContentStyle}
      title={
        <div className={css(styles.titleWrapper, ["VERIFY_EMAIL", "FORGOT_PASSWORD_EMAIL_SENT"].includes(step) === false && styles.titleWrapperWithBorder)}>
          <div style={{  }}>
            {(step == "LOGIN_WITH_EMAIL_FORM" || step == "SIGNUP_FORM" || step == "FORGOT_PASSWORD")  &&
              <IconButton
                overrideStyle={styles.leftBtn}
                size={20}
                onClick={() => {
                  resetErrors();
                  setStep("SELECT_PROVIDER");
                }}>
                  {icons.chevronLeft}
              </IconButton>
            }
            <IconButton
              overrideStyle={styles.closeBtn}
              size={20}
              onClick={(e) => {
                e.stopPropagation();
                resetErrors();
                _handleClose();
              }}>
                {icons.times}
            </IconButton>
            {step === "SELECT_PROVIDER"
              ? `Log in or sign up`
              : step === "LOGIN_WITH_EMAIL_FORM"
              ? `Log in`
              : step === "SIGNUP_FORM"
              ? `Finish sign up`
              : step === "FORGOT_PASSWORD" 
              ? `Reset password`
              : ""
            }
          </div>
        </div>
      }
    >

      {miscError &&
        <div className={css(styles.miscError)}>
          <div style={{fontSize: 18}}>{icons.exclamationCircle}</div>
          {miscError}
        </div>
      }

      <div className={css(styles.contentContainer)}>
        {step === "SELECT_PROVIDER" ? (
          <div>
            <div className={css(styles.titleContainer)}>
              <div className={css(styles.title)}>Welcome to ResearchHub 👋</div>
              <p className={css(styles.subtitle)}>We are an open-science platform that enables discussions, peer-reviews, publications and more.</p>
            </div>
            <FormInput
              required
              containerStyle={styles.inputContainer}
              placeholder="Email"
              error={emailError}
              getRef={emailRef}
              type="email"
              value={email}
              onKeyDown={(e) => {
                e.keyCode === 13 && checkIfAccountExistsApi(e)
              }}
              onChange={(id, value) => {
                if (value.length > 0) {
                  setEmailError(false);
                }
                setEmail(value);
              }}
            />
            <Button
              customButtonStyle={styles.button}
              hideRipples={true}
              fullWidth
              disabled={isLoading ? true : false}
              onClick={checkIfAccountExistsApi}
              label={isLoading ? <Loader loading={true} size={16} color={"white"} /> : "Continue"}
            />

            <div style={{ borderTop: `1px solid ${colors.LIGHT_GREY()}`, position: "relative", marginBottom: 25, marginTop: 25, }}>
              <span style={{ background: "white", padding: "5px 15px", position: "absolute", left: "50%", transform: "translateX(-50%)", top: -15, fontSize: 14 }}>or</span>
            </div>

            <GoogleLoginButton
              styles={[
                styles.button,
                styles.googleButton,
              ]}
              customLabel={`Continue with Google`}
              isLoggedIn={false}
              disabled={false}
            />
          </div>
        ) : step === "LOGIN_WITH_EMAIL_FORM" ? (
          <div>
            <div className={css(styles.titleContainer)}>
              <p className={css(styles.subtitle)}>Enter your password to login.</p>
            </div>            
            <FormInput
              required
              error={passwordError}
              value={password}
              containerStyle={styles.inputContainerShort}
              placeholder="Password"
              type="password"
              onKeyDown={(e) => {
                e.keyCode === 13 && loginApi(e)
              }}
              onChange={(id, value) => {
                if (value.length === 0) {
                  setPasswordError(true);
                }
                else {
                  setPasswordError(false);
                }

                setPassword(value)
              }}
            />
            <span className={css(styles.forgotPassword)} onClick={() => setStep("FORGOT_PASSWORD")}>Forgot password?</span>
            <Button
              fullWidth
              customButtonStyle={styles.button}
              hideRipples={true}
              disabled={isLoading ? true : false}
              onClick={loginApi}
              label={isLoading ? <Loader loading={true} size={16} color={"white"} /> : "Log in"}
            />
          </div>
        ) : step === "SIGNUP_FORM" ? (
          <>
            <div className={css(styles.titleContainer)}>
              <p className={css(styles.subtitle)}>Fill in the following to join our platform.</p>
            </div>                  
            <FormInput
              required
              error={firstNameError}
              containerStyle={styles.inputContainer}
              placeholder="First name"
              type="text"
              onChange={(id, value) => {
                if (value.length > 0) {
                  setFirstNameError(false);
                }
                setFirstName(value)
              }}
            />

            <FormInput
              required
              error={lastNameError}
              containerStyle={styles.inputContainer}
              placeholder="Last name"
              type="text"
              onChange={(id, value) => {
                if (value.length > 0) {
                  setLastNameError(false);
                }              
                setLastName(value)
              }}
            />
            <FormInput
              required
              error={passwordError}
              containerStyle={styles.inputContainer}
              value={password}
              placeholder="Password"
              type="password"
              onKeyDown={(e) => {
                e.keyCode === 13 && createAccountApi(e)
              }}
              onChange={(id, value) => {
                if (value.length > 8) {
                  setPasswordError(false);
                }              
                setPassword(value)
              }}
            />
            <Button
              customButtonStyle={styles.button}
              hideRipples={true}
              disabled={isLoading ? true : false}
              onClick={createAccountApi}
              fullWidth
              label={isLoading ? <Loader loading={true} size={16} color={"white"} /> : "Sign up"}
            />
          </>
        ) : step === "VERIFY_EMAIL" ? (
          <div>
            <div className={css(styles.titleContainer)}>
              <div className={css(styles.title)}>Check you email.</div>
              <p className={css(styles.subtitle)}>An activation link was sent to your email.</p>
            </div>
            <div style={{fontSize: 64, textAlign: "center", marginTop: 25, marginBottom: 25 }}>{icons.envelope}</div>
            <Button
              fullWidth
              customButtonStyle={styles.button}
              hideRipples={true}
              onClick={(e) => {
                e.stopPropagation();
                _handleClose();
              }}
              label={"Close"}
            />            
          </div>
        ) : step === "FORGOT_PASSWORD" ? (
          <div>
            <div className={css(styles.titleContainer)}>
              <p className={css(styles.subtitle)}>
                Enter the email address associated with your account, and we’ll email you a link to reset your password.
              </p>
            </div>
            <FormInput
              required
              containerStyle={styles.inputContainer}
              placeholder="Email"
              error={emailError}
              getRef={emailRef}
              type="email"
              value={email}
              onKeyDown={(e) => {
                e.keyCode === 13 && resetPasswordApi(e)
              }}
              onChange={(id, value) => {
                if (value.length > 0) {
                  setEmailError(false);
                }
                setEmail(value);
              }}
            />               
            <Button
              fullWidth
              customButtonStyle={styles.button}
              hideRipples={true}
              onClick={resetPasswordApi}
              disabled={isLoading ? true : false}
              label={isLoading ? <Loader loading={true} size={16} color={"white"} /> : "Send reset email"}
            />                  
          </div>
        ) : step === "FORGOT_PASSWORD_EMAIL_SENT" ? (
          <div>
            <div className={css(styles.titleContainer)}>
              <div className={css(styles.title)}>Check you email.</div>
              <p className={css(styles.subtitle)}>Password Reset link was sent to your email.</p>
            </div>
            <div style={{fontSize: 64, textAlign: "center", marginTop: 25, marginBottom: 25 }}>{icons.envelope}</div>
            <Button
              fullWidth
              customButtonStyle={styles.button}
              hideRipples={true}
              onClick={(e) => {
                e.stopPropagation();
                _handleClose();
              }}
              label={"Close"}
            />            
          </div>
        ) : null}
      </div>

    </BaseModal>  
  )  
}

const styles = StyleSheet.create({
  miscError: {
    margin: "0 20px 10px 20px",
    background: "rgb(255, 244, 229)",
    color: "rgb(237, 108, 2)",
    padding: "10px 20px",
    borderRadius: "4px",
    columnGap: "10px",
    display: "flex",
    boxSizing: "border-box",
  },
  contentContainer: {
    padding: "0px 25px 25px 25px",
    width: "100%",
    boxSizing: "border-box",
  },
  titleContainer: {
    textAlign: "left",
    padding: "0 0px",
    marginBottom: 20,
    marginTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    margin: 0,
    lineHeight: "1.5em",
  },  
  inputContainer: {
    margin: 0,
    marginBottom: 0,
  },
  inputContainerShort: {
    margin: 0,
    marginBottom: 0,    
    minHeight: 60,
  },
  forgotPassword: {
    fontWeight: 500,
    textDecoration: "underline",
    cursor: "pointer",
    marginBottom: 25,
    display: "block",
    fontSize: 14,
  },
  modalTitleStyleOverride: {
    height: "auto",

    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      width: "100%"
    }
  },
  button: {
    display: "block",
  },
  googleButton: {
    background: "white",
    border: `1px solid ${colors.BLACK()}`,
    borderRadius: "4px",
    color: colors.BLACK(),
    display: "flex",
    height: "42px",
  },
  googleButtonLabel: {
    color: colors.BLACK(),
  },
  modalContentStyle: {
    padding: 0,
    width: 460,
    display: "block",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      width: "100%",
      padding: 0,
    }
  },
  titleWrapper: {
    padding: 15,
    marginBottom: 15,
    justifyContent: "center",
    position: "relative",
    flexDirection: "row",
    display: "flex",
    fontSize: 16,
  },
  titleWrapperWithBorder: {
    borderBottom: `1px solid ${colors.LIGHT_GREY()}`,
  },
  leftBtn: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
  }  
});

const mapStateToProps = (state) => ({
  modals: state.modals,
});

const mapDispatchToProps = {
  setMessage: MessageActions.setMessage,
  showMessage: MessageActions.showMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);
