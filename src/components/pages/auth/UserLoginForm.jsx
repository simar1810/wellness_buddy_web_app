import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/fetchers/app";

export default function UserLoginForm() {
  const { userLogin, dispatch } = useCurrentStateContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    dispatch({
      type: "UPDATE_USER_LOGIN",
      payload: { field, value }
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!userLogin.userId || !userLogin.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const result = await loginUser({
        userId: userLogin.userId,
        password: userLogin.password
      });

      if (result.success) {
        // Store user data and redirect
        localStorage.setItem("userData", JSON.stringify(result.data));
        localStorage.setItem("userType", "user");
        toast.success(result.message);
        router.push("/coach/dashboard");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            User Login
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Sign in to your user account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                value={userLogin.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                placeholder="Enter your User ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={userLogin.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[var(--accent-1)] hover:bg-[var(--accent-1)]/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
