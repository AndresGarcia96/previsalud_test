import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { redirect } from "next/navigation";

import { setStateUser } from "@/redux/features/user/userSlice";

const useAuthValidationAdmin = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  const idNumberUserSession = session?.user?.id_number;

  const idNumberUserSessionState = useAppSelector(
    (state) => state.user.id_number
  );

  useEffect(() => {
    if (!idNumberUserSessionState) {
      dispatch(
        setStateUser({ field: "id_number", value: idNumberUserSession })
      );
    }

    if (status === "unauthenticated") {
      redirect(`${process.env.NEXT_PUBLIC_FENIX_URL}/login`);
    }
  }, [status, idNumberUserSessionState, session]);
};

export default useAuthValidationAdmin;
