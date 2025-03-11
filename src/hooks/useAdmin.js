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
    if (!currentUser.userName) return;
    axios
      .get(
        `${URL_BACK}/user_access/${currentUser.userName}/${tgWebAppData.user.id}`
      )
      .then(({ data }) => {
        dispatch(
          setCurrentUser({
            adminAccess: data.exists,
            superuser: data.superuser,
          })
        );
      });
  }, [currentUser.userName, tgWebAppData.user.id]);

  useEffect(() => {
    if (
      currentUser.userId === tgWebAppData.user.id &&
      currentUser.userName === tgWebAppData.user.username
    ) {
      return;
    }
    axios.patch(`${URL_BACK}/updateUser/`, {
      userName: currentUser.userName,
      tg_id: tgWebAppData.user.id,
    });
  }, [currentUser.userName, tgWebAppData.user.id]);

  useEffect(() => {
    if (
      currentUser.userId === tgWebAppData.user.id &&
      currentUser.userName === tgWebAppData.user.username
    ) {
      return;
    }

    dispatch(
      setCurrentUser({
        userId: tgWebAppData.user.id,
        userName: tgWebAppData.user.username,
      })
    );
  }, [tgWebAppData.user.id, tgWebAppData.user.username]);

  return currentUser;
};
