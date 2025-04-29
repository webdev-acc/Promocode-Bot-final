import { useDispatch, useSelector } from "react-redux";
import { selectUsers, setCurrentUser } from "../store/slices/users/usersSlice";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEffect } from "react";
import axios from "axios";
import { URL_BACK } from "../constants";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(selectUsers);
  const { tgWebAppData } = retrieveLaunchParams();

  useEffect(() => {
    const telegramUserId = tgWebAppData?.user?.id;
    const telegramUserName = tgWebAppData?.user?.username;

    if (
      telegramUserId &&
      telegramUserName &&
      (currentUser.userId !== telegramUserId ||
        currentUser.userName !== telegramUserName)
    ) {
      dispatch(
        setCurrentUser({
          userId: telegramUserId,
          userName: telegramUserName,
          role: currentUser.role || "user",
        })
      );
    }
  }, [
    dispatch,
    tgWebAppData?.user?.id,
    tgWebAppData?.user?.username,
    currentUser,
  ]);

  useEffect(() => {
    const telegramUserId = tgWebAppData?.user?.id;
    const userName = currentUser.userName;

    if (!userName || !telegramUserId) return;

    axios
      .get(`${URL_BACK}/user_access/${userName}/${telegramUserId}`)
      .then(({ data }) => {
        dispatch(
          setCurrentUser({
            ...currentUser,
            adminAccess:
              data.exists && ["admin", "moderator"].includes(data.role),
            role: data.role || "user",
            id: data.id,
          })
        );
      })
      .catch((error) => {
        console.error("Ошибка проверки доступа:", error);
        dispatch(
          setCurrentUser({
            ...currentUser,
            adminAccess: false,
            role: "user",
          })
        );
      });
  }, [dispatch, currentUser.userName, tgWebAppData?.user?.id]);

  function addUserId(currentUserId, tgUserId) {
    axios
      .patch(`${URL_BACK}/editUser/${currentUserId}`, {
        tg_id: tgUserId,
      })
      .catch((error) =>
        console.error("Ошибка обновления пользователя:", error)
      );
  }

  return {
    ...currentUser,
    isAdmin: currentUser.role === "admin",
    isModerator: currentUser.role === "moderator",
    isUser: currentUser.role === "user",
    addUserId,
  };
};
