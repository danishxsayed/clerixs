'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Key, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Copy, 
  Check, 
  Lock, 
  Mail, 
  Loader2, 
  Eye, 
  EyeOff, 
  Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  createBranchLoginAction, 
  resetBranchPasswordAction, 
  toggleBranchLoginStatusAction 
} from './actions';

interface BranchManagerActionsProps {
  branch: {
    id: string;
    name: string;
    email?: string | null;
    has_login: boolean;
    login_email?: string | null;
    login_status?: string | null;
  };
  isEnterprise: boolean;
}

export function BranchManagerActions({ branch, isEnterprise }: BranchManagerActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'both' | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showStatusConfirmModal, setShowStatusConfirmModal] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Reset password states
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Success states
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string } | null>(null);
  const [resetCredentials, setResetCredentials] = useState<{ pass: string } | null>(null);

  // Email validation state
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (val && !emailRegex.test(val)) {
      setEmailError('Please enter a valid email address (e.g. doctor@clinic.com)');
      return false;
    } else if (!val) {
      setEmailError('Email address is required.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };

  const handleOpenCreate = () => {
    // Pre-fill with the branch contact email if available, otherwise blank
    setEmail(branch.email || '');
    const pass = generateSecurePassword();
    setPassword(pass);
    setConfirmPassword(pass);
    setCreatedCredentials(null);
    setShowCreateModal(true);
  };

  const handleOpenReset = () => {
    const pass = generateSecurePassword();
    setResetPassword(pass);
    setResetCredentials(null);
    setShowResetModal(true);
  };

  const copyToClipboard = async (text: string, field: 'email' | 'password' | 'both') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address (e.g. doctor@clinic.com)');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const result = await createBranchLoginAction(branch.id, email, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Branch login created successfully!');
        setCreatedCredentials({ email, pass: password });
      }
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    startTransition(async () => {
      const result = await resetBranchPasswordAction(branch.id, resetPassword);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Password updated successfully!');
        setResetCredentials({ pass: resetPassword });
      }
    });
  };

  const handleToggleStatus = () => {
    const nextAction = branch.login_status === 'disabled' ? 'enable' : 'disable';
    startTransition(async () => {
      const result = await toggleBranchLoginStatusAction(branch.id, nextAction);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Branch login successfully ${nextAction === 'enable' ? 'enabled' : 'disabled'}!`);
        setShowStatusConfirmModal(false);
      }
    });
  };

  if (!isEnterprise) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="opacity-50 cursor-not-allowed text-xs"
        onClick={() => toast.info("Enterprise Branch Access is only available on our Enterprise Plan. Please upgrade in Billing settings.")}
      >
        <Key className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
        Provision Login (Enterprise Only)
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {branch.has_login ? (
        <>
          <div className="flex flex-col items-end mr-3">
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">{branch.login_email}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {branch.login_status === 'disabled' ? (
                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Disabled</Badge>
              ) : (
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 border-none text-[10px] px-1 py-0 h-4">Active Manager</Badge>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenReset}
            className="text-xs h-8 border-dashed hover:border-solid transition-all"
          >
            <Key className="mr-1 h-3 w-3" />
            Reset Password
          </Button>

          {branch.login_status === 'disabled' ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStatusConfirmModal(true)}
              className="text-xs h-8 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400"
            >
              <UserCheck className="mr-1 h-3 w-3" />
              Enable
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowStatusConfirmModal(true)}
              className="text-xs h-8 border-amber-200 hover:border-amber-500 hover:bg-amber-50 text-amber-700 dark:text-amber-400"
            >
              <UserX className="mr-1 h-3 w-3" />
              Disable
            </Button>
          )}
        </>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenCreate}
          className="text-xs h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900"
        >
          <Key className="mr-1.5 h-3.5 w-3.5" />
          Create Branch Login
        </Button>
      )}

      {/* CREATE LOGIN MODAL */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        if (!isPending) {
          setShowCreateModal(open);
          if (!open) setCreatedCredentials(null);
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {createdCredentials ? (
            <div className="space-y-6 py-2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                  <UserCheck className="h-6 w-6" />
                  Credentials Created Successfully!
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Please copy these login credentials and share them with the branch manager. For security reasons, this password will not be shown again.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Branch Name</Label>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {branch.name}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-muted-foreground/10">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Login Email</Label>
                  <div className="flex items-center justify-between gap-2 bg-background p-2 rounded-lg border font-mono text-sm overflow-hidden">
                    <span className="truncate select-all">{createdCredentials.email}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                    >
                      {copiedField === 'email' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-muted-foreground/10">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Initial Password</Label>
                  <div className="flex items-center justify-between gap-2 bg-background p-2 rounded-lg border font-mono text-sm overflow-hidden">
                    <span className="truncate select-all">{createdCredentials.pass}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(createdCredentials.pass, 'password')}
                    >
                      {copiedField === 'password' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => copyToClipboard(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}`, 'both')}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Both
                </Button>
                <Button 
                  type="button" 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedCredentials(null);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} noValidate className="space-y-5">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Key className="h-5 w-5 text-blue-600" />
                  Create Branch Login
                </DialogTitle>
                <DialogDescription>
                  Provision a dedicated secure account for <strong className="text-foreground">{branch.name}</strong> branch.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Login Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      required
                      placeholder="branch@example.com"
                      className={cn(
                        "pl-9 font-mono text-sm",
                        emailError && "border-red-500 focus-visible:ring-red-500"
                      )}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={handleEmailBlur}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs font-bold text-red-500 mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pass" className="text-sm font-medium">Password</Label>
                    <button 
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        const pass = generateSecurePassword();
                        setPassword(pass);
                        setConfirmPassword(pass);
                      }}
                    >
                      Generate Secure Password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pass"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="pl-9 pr-9 font-mono text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPass" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPass"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="pl-9 font-mono text-sm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isPending}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Login'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* RESET PASSWORD MODAL */}
      <Dialog open={showResetModal} onOpenChange={(open) => {
        if (!isPending) {
          setShowResetModal(open);
          if (!open) setResetCredentials(null);
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {resetCredentials ? (
            <div className="space-y-6 py-2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl text-blue-600">
                  <UserCheck className="h-6 w-6" />
                  Password Reset Successfully!
                </DialogTitle>
                <DialogDescription>
                  The password for <strong className="text-foreground">{branch.login_email}</strong> has been updated. Please share it with the branch manager.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">New Password</Label>
                  <div className="flex items-center justify-between gap-2 bg-background p-2 rounded-lg border font-mono text-sm overflow-hidden">
                    <span className="truncate select-all">{resetCredentials.pass}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(resetCredentials.pass, 'password')}
                    >
                      {copiedField === 'password' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetCredentials(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Key className="h-5 w-5 text-blue-600" />
                  Reset Branch Password
                </DialogTitle>
                <DialogDescription>
                  Generate a new secure password for <strong className="text-foreground">{branch.name}</strong> ({branch.login_email}).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="resetPass" className="text-sm font-medium">New Password</Label>
                    <button 
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => setResetPassword(generateSecurePassword())}
                    >
                      Generate Secure Password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetPass"
                      type={showResetPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="pl-9 pr-9 font-mono text-sm"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                    >
                      {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isPending}
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DISABLE/ENABLE CONFIRM MODAL */}
      <Dialog open={showStatusConfirmModal} onOpenChange={(open) => {
        if (!isPending) setShowStatusConfirmModal(open);
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-amber-600">
              <ShieldAlert className="h-5 w-5" />
              {branch.login_status === 'disabled' ? 'Enable Branch Login' : 'Disable Branch Login'}
            </DialogTitle>
            <DialogDescription className="pt-1.5">
              {branch.login_status === 'disabled' ? (
                <>
                  Are you sure you want to re-enable branch login access for <strong className="text-foreground">{branch.name}</strong> ({branch.login_email})? They will immediately regain access to the clinic dashboard.
                </>
              ) : (
                <>
                  Are you sure you want to disable branch login access for <strong className="text-foreground">{branch.name}</strong> ({branch.login_email})? Their active session will be invalidated, and they will be blocked from accessing the system.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending}
              onClick={() => setShowStatusConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={isPending}
              onClick={handleToggleStatus}
              className={branch.login_status === 'disabled' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                branch.login_status === 'disabled' ? 'Confirm Enable' : 'Confirm Disable'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
