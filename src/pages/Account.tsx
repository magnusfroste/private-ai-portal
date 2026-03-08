import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AccountPage } from "@/views/Account/AccountPage";

const Account = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return <AccountPage />;
};

export default Account;
