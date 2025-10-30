import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id,name,country,bio,profile_image_url,role,is_admin,is_active,deactivated_reason,created_at")
        .order("created_at", { ascending: false });
      if (search.trim()) q = q.ilike("name", `%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const requestsQuery = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, student_id, mentor_id, date, time, topic, status, created_at, student:profiles!session_requests_student_id_fkey(name), mentor:profiles!session_requests_mentor_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, student_id, mentor_id, date, time, status, notes, created_at, student:profiles!sessions_student_id_fkey(name), mentor:profiles!sessions_mentor_id_fkey(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (row: any) => {
      const { error } = await supabase
        .from("profiles")
        .update({ name: row.name, country: row.country, bio: row.bio, role: row.role, is_admin: row.is_admin })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Hard delete profile row. (Deleting auth.users requires service key; do in dashboard or Edge Function.)
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: false, deactivated_reason: reason })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeactivateOpen(false);
      setDeactivateReason("");
      setTargetUserId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: true, deactivated_reason: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const acceptReqMutation = useMutation({
    mutationFn: async (req: any) => {
      const { error: upErr } = await supabase.from("session_requests").update({ status: "accepted" }).eq("id", req.id);
      if (upErr) throw upErr;
      const { error: sessErr } = await supabase.from("sessions").insert({
        student_id: req.student_id,
        mentor_id: req.mentor_id,
        date: req.date,
        time: req.time,
        status: "upcoming",
        notes: req.topic || null,
      });
      if (sessErr) throw sessErr;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }),
      ]);
    },
  });

  const declineReqMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("session_requests").update({ status: "declined" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="w-64">
              <Input placeholder="Search users by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="requests">Session Requests</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Country</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Admin</th>
                      <th className="py-2 pr-4">Active</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersQuery.data || []).map((u: any, idx: number) => (
                      <motion.tr key={u.id} className="border-t" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.02 }}>
                        <td className="py-2 pr-4">
                          <Input value={u.name || ""} onChange={(e) => (u.name = e.target.value)} />
                        </td>
                        <td className="py-2 pr-4">
                          <Input value={u.country || ""} onChange={(e) => (u.country = e.target.value)} />
                        </td>
                        <td className="py-2 pr-4">
                          <select className="border rounded px-2 py-1" value={u.role} onChange={(e) => (u.role = e.target.value)}>
                            <option value="student">student</option>
                            <option value="mentor">mentor</option>
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <input type="checkbox" checked={u.is_admin} onChange={(e) => (u.is_admin = e.target.checked)} />
                        </td>
                        <td className="py-2 pr-4">
                          <span className={u.is_active ? "text-green-600" : "text-red-600"}>{u.is_active ? "Active" : "Inactive"}</span>
                        </td>
                            <td className="py-2 pr-4 space-x-2">
                              <Button size="sm" onClick={() => updateMutation.mutate({ ...u })}>Save</Button>
                              {u.is_active ? (
                                <Button size="sm" variant="outline" onClick={() => { setTargetUserId(u.id); setDeactivateOpen(true); }}>Deactivate</Button>
                              ) : (
                                <Button size="sm" variant="secondary" onClick={() => activateMutation.mutate(u.id)}>Activate</Button>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(u.id)}>Delete</Button>
                            </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {usersQuery.isLoading && <p className="text-sm text-muted-foreground mt-4">Loading...</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Session Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Student</th>
                          <th className="py-2 pr-4">Mentor</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(requestsQuery.data || []).map((r: any, idx: number) => (
                          <motion.tr key={r.id} className="border-t" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.02 }}>
                            <td className="py-2 pr-4">{r.student?.name || r.student_id}</td>
                            <td className="py-2 pr-4">{r.mentor?.name || r.mentor_id}</td>
                            <td className="py-2 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                            <td className="py-2 pr-4">{r.time}</td>
                            <td className="py-2 pr-4">{r.status}</td>
                            <td className="py-2 pr-4 space-x-2">
                              <Button size="sm" onClick={() => acceptReqMutation.mutate(r)} disabled={r.status !== "pending"}>Accept</Button>
                              <Button size="sm" variant="outline" onClick={() => declineReqMutation.mutate(r.id)} disabled={r.status !== "pending"}>Decline</Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {requestsQuery.isLoading && <p className="text-sm text-muted-foreground mt-4">Loading...</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 pr-4">Student</th>
                          <th className="py-2 pr-4">Mentor</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(sessionsQuery.data || []).map((s: any, idx: number) => (
                          <motion.tr key={s.id} className="border-t" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.02 }}>
                            <td className="py-2 pr-4">{s.student?.name || s.student_id}</td>
                            <td className="py-2 pr-4">{s.mentor?.name || s.mentor_id}</td>
                            <td className="py-2 pr-4">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="py-2 pr-4">{s.time}</td>
                            <td className="py-2 pr-4">{s.status}</td>
                            <td className="py-2 pr-4 space-x-2">
                              <Button size="sm" variant="outline" onClick={() => cancelSessionMutation.mutate(s.id)} disabled={s.status === "cancelled"}>Cancel</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteSessionMutation.mutate(s.id)}>Delete</Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                    {sessionsQuery.isLoading && <p className="text-sm text-muted-foreground mt-4">Loading...</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate user</DialogTitle>
                <DialogDescription>
                  Enter the reason for deactivation. The user will see this message when trying to log in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Input value={deactivateReason} onChange={(e) => setDeactivateReason(e.target.value)} placeholder="Reason" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
                <Button onClick={() => targetUserId && deactivateMutation.mutate({ id: targetUserId, reason: deactivateReason || "No reason provided" })}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}


