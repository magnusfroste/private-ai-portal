import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Key, BarChart, LogOut, Copy, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Profile {
  full_name: string | null;
  email: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_value: string;
  created_at: string;
  expires_at: string | null;
  trial_credits_usd: number;
  used_credits_usd: number;
  is_active: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const availableModels = [
    "all-team-models"
  ];

  useEffect(() => {
    checkAuth();
    fetchProfile();
    fetchApiKeys();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("api_keys")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setApiKeys(data || []);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreatingKey(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const accessToken = session.access_token;

      console.log('Invoking function with token:', accessToken ? 'Bearer ' + accessToken.substring(0, 20) + '...' : 'none');
      console.log('Session info:', {
        user: session.user.email,
        expiresAt: session.expires_at,
        provider: session.user.app_metadata.provider
      });
      
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { 
          keyName: newKeyName,
          models: selectedModels.length > 0 ? selectedModels : undefined,
          teamId: 'e2e76f95-0fbf-4077-bf9c-0d16880f99b0'
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      toast.success("API key created successfully!");
      setNewKeyName("");
      setSelectedModels([]);
      fetchApiKeys();
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const totalCredits = apiKeys.reduce((sum, key) => sum + Number(key.trial_credits_usd), 0);
  const usedCredits = apiKeys.reduce((sum, key) => sum + Number(key.used_credits_usd), 0);
  const remainingCredits = totalCredits - usedCredits;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="glass-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold gradient-text">Autoversio</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Developer"}
          </h1>
          <p className="text-muted-foreground">{profile?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalCredits.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(totalCredits * 1000000).toLocaleString()} tokens available
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Used</CardTitle>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${usedCredits.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(usedCredits * 1000000).toLocaleString()} tokens
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <BarChart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">${remainingCredits.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(remainingCredits * 1000000).toLocaleString()} tokens left
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Key className="w-6 h-6" />
                  API Keys
                </CardTitle>
                <CardDescription className="mt-2">
                  Manage your API keys for accessing the LiteLLM proxy
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Give your API key a descriptive name to help you identify it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., Production App, Testing"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        disabled={isCreatingKey}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Models (Optional)</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select specific models or leave empty for all models
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {availableModels.map((model) => (
                          <div key={model} className="flex items-center space-x-2">
                            <Checkbox
                              id={model}
                              checked={selectedModels.includes(model)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedModels([...selectedModels, model]);
                                } else {
                                  setSelectedModels(selectedModels.filter(m => m !== model));
                                }
                              }}
                              disabled={isCreatingKey}
                            />
                            <Label
                              htmlFor={model}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {model}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-semibold">Trial Key Includes:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• $25 in credits</li>
                        <li>• 5 days validity</li>
                        <li>• {selectedModels.length > 0 ? `Access to ${selectedModels.length} selected models` : 'Full LLM access'}</li>
                      </ul>
                    </div>
                    <Button 
                      onClick={createApiKey} 
                      disabled={isCreatingKey}
                      className="w-full"
                    >
                      {isCreatingKey ? "Creating..." : "Create API Key"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Key className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                <div>
                  <p className="text-lg font-semibold">No API keys yet</p>
                  <p className="text-muted-foreground">Create your first API key to get started</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => {
                  const daysRemaining = key.expires_at 
                    ? Math.ceil((new Date(key.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const creditsRemaining = Number(key.trial_credits_usd) - Number(key.used_credits_usd);

                  return (
                    <div key={key.id} className="glass-card p-4 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{key.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {daysRemaining !== null && (
                            <p className="text-sm">
                              <span className="text-accent font-semibold">{daysRemaining}</span> days left
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            ${creditsRemaining.toFixed(2)} remaining
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          value={showKey[key.id] ? key.key_value : "av_" + "•".repeat(60)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(key.key_value)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${(creditsRemaining / Number(key.trial_credits_usd)) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
            <CardDescription>
              Use your API key with the LiteLLM proxy endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <div className="flex gap-2">
                <Input
                  value="https://litellm.autoversio.ai/"
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard("https://litellm.autoversio.ai/")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm space-y-2">
              <p className="text-muted-foreground"># Example usage with curl:</p>
              <p>curl https://litellm.autoversio.ai/v1/chat/completions \</p>
              <p className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
              <p className="ml-4">-H "Content-Type: application/json" \</p>
              <p className="ml-4">-d '{"{"}"model": "gpt-4", "messages": [...]{"}"}'</p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              For more information, visit the{" "}
              <a 
                href="https://docs.litellm.ai/docs/providers/github" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                LiteLLM documentation
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
