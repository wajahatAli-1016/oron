import axios from "axios";
import { Task } from "../types";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("Missing VITE_API_URL. Set your backend API URL in frontend .env.");
}

const getAuthToken = () => {
  const auth = localStorage.getItem("oron_auth");
  if (!auth) return "";
  try {
    return (JSON.parse(auth) as { token?: string }).token || "";
  } catch {
    return "";
  }
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

type BackendTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type FrontendTaskStatus = Task["status"];

type TaskPayload = {
  id?: string;
  residentId?: string;
  branchId?: string;
  facilityId?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: BackendTaskStatus;
  dueDate?: string;
  assignedToId?: string;
  createdById?: string;
};

export interface CreateTaskRequest {
  residentId: string;
  branchId: string;
  facilityId: string;
  title: string;
  description?: string;
  category: string;
  status: FrontendTaskStatus;
  dueDate: string;
  assignedToId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  status?: FrontendTaskStatus;
  dueDate?: string;
}

const toFrontendStatus = (status?: BackendTaskStatus): FrontendTaskStatus => {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "DONE") return "Done";
  return "Todo";
};

export const toBackendStatus = (status: FrontendTaskStatus): BackendTaskStatus => {
  if (status === "In Progress") return "IN_PROGRESS";
  if (status === "Done") return "DONE";
  return "TODO";
};

export const normalizeTask = (item: TaskPayload): Task => ({
  id: item.id || "",
  residentId: item.residentId || "",
  branchId: item.branchId || "",
  facilityId: item.facilityId || "",
  title: item.title || "",
  description: item.description || "",
  category: (item.category || "General") as Task["category"],
  status: toFrontendStatus(item.status),
  dueDate: item.dueDate || new Date().toISOString(),
  assignedTo: item.assignedToId || "",
  createdBy: item.createdById || "",
});

export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    const response = await axios.get(`${API_BASE}/task`, { headers: getHeaders() });
    const payload = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return (payload as TaskPayload[]).map(normalizeTask);
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await axios.post(
      `${API_BASE}/task`,
      { ...data, status: toBackendStatus(data.status) },
      { headers: getHeaders() },
    );
    return normalizeTask(response.data as TaskPayload);
  },

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await axios.patch(
      `${API_BASE}/task/${id}`,
      {
        ...data,
        status: data.status ? toBackendStatus(data.status) : undefined,
      },
      { headers: getHeaders() },
    );
    return normalizeTask(response.data as TaskPayload);
  },
};

