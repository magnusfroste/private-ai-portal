import { useState, useEffect, useRef } from "react";
import { CreditCard, Zap, Loader2, DollarSign } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/useProfile";
import { transactionRepository } from "@/data/repositories/transactionRepository";
import { CreditTransaction } from "@/models/types/transaction.types";
import { supabase } from "@/integrations/supabase/client";

const CREDIT_PACKS = [
  { id: "small", label: "$5", credits: 5, description: "5 credits" },
  { id: "medium", label: "$20", credits: 20, description: "20 credits", popular: true },
  { id: "large", label: "$100", credits: 100, description: "100 credits" },
];

export const CreditsPage = () => {
  const { profile, refetch: refetchProfile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const verifiedRef = useRef(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId && !verifiedRef.current) {
      verifiedRef.current = true;
      toast.loading("Verifying payment...", { id: "verify-payment" });

      supabase.functions
        .invoke("verify-payment", { body: { session_id: sessionId } })
        .then(({ data, error }) => {
          if (error || data?.error) {
            toast.error("Could not verify payment. Contact support if credits are missing.", { id: "verify-payment" });
          } else if (data?.status === "paid") {
            toast.success(`Payment verified! ${data.credits_added} credits added.`, { id: "verify-payment" });
            refetchProfile();
            loadTransactions();
          } else {
            toast.info("Payment not yet completed.", { id: "verify-payment" });
          }
        });

      setSearchParams({});
    } else if (payment === "canceled") {
      toast.info("Payment was canceled.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, refetchProfile]);

  const loadTransactions = async () => {
    try {
      setTxLoading(true);
      const data = await transactionRepository.fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleBuyCredits = async (pack: string) => {
    try {
      setLoadingPack(pack);
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { pack },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Balance */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Credits</h1>
        <p className="text-muted-foreground text-sm">Manage your API credit balance</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
              <p className="text-4xl font-bold tracking-tight">
                <span className="text-muted-foreground text-2xl mr-1">$</span>
                {profile?.purchased_credits_usd.toFixed(2) ?? "0.00"}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-primary opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Buy Credits */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Add Credits</CardTitle>
          <CardDescription>Top up your account with API credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {CREDIT_PACKS.map((pack) => (
              <Button
                key={pack.id}
                variant={pack.popular ? "default" : "outline"}
                className={`h-auto py-4 flex flex-col gap-1 ${pack.popular ? "glow" : ""}`}
                disabled={loadingPack !== null}
                onClick={() => handleBuyCredits(pack.id)}
              >
                {loadingPack === pack.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-lg font-bold">{pack.label}</span>
                    <span className="text-xs opacity-70">{pack.description}</span>
                    {pack.popular && (
                      <Badge variant="secondary" className="text-[10px] mt-1">Popular</Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <CardDescription>Your credit purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ${tx.amount_usd.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        +${tx.credits_added.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
