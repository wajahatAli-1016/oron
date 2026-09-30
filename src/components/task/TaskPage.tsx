import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Calendar, User, Eye, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { Button, Badge, Modal, FilterDropdown } from '../../components/UI';
import { Task, getFullName, Resident } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  useGetBranchDashboardQuery,
  useGetResidentsPaginatedQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { useNavigate } from 'react-router-dom';
import { TaskManagementsSkeleton } from '../skeletons/TaskSkeleton';
import { RefreshButton } from '../refresh/Refresh';

type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export const TaskManagements = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const errorToastShown = useRef(false);
  const isBranchAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError: dashboardIsError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetBranchDashboardQuery(undefined, { skip: !isBranchAdmin });

  const {
    data: tasksAll = [],
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    isError: tasksIsError,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTasksQuery(undefined, { skip: isBranchAdmin });

  const {
    data: residentsPage,
    isLoading: residentsLoading,
    isFetching: residentsFetching,
    isError: residentsIsError,
    error: residentsError,
    refetch: refetchResidents,
  } = useGetResidentsPaginatedQuery(
    { page: 1, limit: 500 },
    { skip: isBranchAdmin },
  );

  const [updateTask] = useUpdateTaskMutation();

  const [actionError, setActionError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const queryError = dashboardIsError
    ? getApiErrorMessage(dashboardError, 'Failed to load task data')
    : tasksIsError
      ? getApiErrorMessage(tasksError, 'Failed to load task data')
      : residentsIsError
        ? getApiErrorMessage(residentsError, 'Failed to load task data')
        : null;

  useEffect(() => {
    if (!queryError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(queryError);
  }, [queryError, toast]);

  const taskList = useMemo(() => {
    const tasks = isBranchAdmin ? (dashboard?.tasks ?? []) : tasksAll;
    if (isStaff && user?.id) {
      return tasks.filter((t) => (t.assignedTo || '') === user.id);
    }
    return tasks;
  }, [dashboard?.tasks, isBranchAdmin, isStaff, tasksAll, user?.id]);

  const residents: Resident[] = isBranchAdmin
    ? (dashboard?.residents ?? [])
    : (residentsPage?.data ?? []);

  const staffMembers = isBranchAdmin ? (dashboard?.staff ?? []) : [];

  const loading = isBranchAdmin
    ? dashboardLoading
    : tasksLoading || residentsLoading;

  const isFetching = isBranchAdmin
    ? dashboardFetching
    : tasksFetching || residentsFetching;

  const refetchAll = () => {
    if (isBranchAdmin) void refetchDashboard();
    else {
      void refetchTasks();
      void refetchResidents();
    }
  };

  const columns: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      void moveTask(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!taskList.find((t) => t.id === taskId)) return;
    setActionError(null);
    try {
      await updateTask({ id: taskId, body: { status: newStatus } }).unwrap();
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update task status');
      setActionError(message);
      toast.error(message);
    }
  };

  const handleGoToCreateTask = () => {
    navigate('/admin/tasks/new');
  };

  const getTaskCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const categories = [
    'All',
    'Medication',
    'Bathing',
    'Vitals',
    'Therapy',
    'Observation',
    'Meal',
    'General',
  ];

  const categoryFilterOptions = useMemo(() => {
    const counts: Record<string, number> = { All: taskList.length };
    for (const category of categories) {
      if (category === 'All') continue;
      counts[category] = taskList.filter((t) => t.category === category).length;
    }
    return categories.map((category) => ({
      value: category,
      label: category === 'All' ? 'All Categories' : category,
      count: counts[category] ?? 0,
    }));
  }, [taskList, categories]);

  if (loading) {
    return <TaskManagementsSkeleton />;
  }

  const displayError = actionError || queryError;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">
            {isStaff ? 'My Tasks' : 'Task Board'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStaff
              ? 'Manage your assigned tasks for today.'
              : 'Manage and track care tasks across the facility.'}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <FilterDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryFilterOptions}
            ariaLabel="Filter by category"
            minWidth="11rem"
            showCountInTrigger
          />

          {isBranchAdmin && (
            <Button icon={Plus} onClick={handleGoToCreateTask}>
              Create Task
            </Button>
          )}
          <RefreshButton onRefresh={refetchAll} isLoading={isFetching} />
        </div>
      </div>
      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {displayError}
        </div>
      )}

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex flex-col md:flex-row gap-6 md:h-full md:min-w-[1000px]">
          {columns.map((column) => {
            const columnTasks = taskList.filter(
              (t) =>
                t.status === column &&
                (categoryFilter === 'All' || t.category === categoryFilter),
            );

            return (
              <div
                key={column}
                className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden transition-colors"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
              >
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 pointer-events-none">
                  <h2 className="font-semibold text-slate-700">{column}</h2>
                  <Badge variant="default">{columnTasks.length}</Badge>
                </div>

                <div className="flex-1 p-3 overflow-y-auto scrollbar-hide space-y-3">
                  <AnimatePresence>
                    {columnTasks.map((task) => {
                      const assignedStaff = staffMembers.find(
                        (s) => s.id === task.assignedTo,
                      );
                      const resident = residents.find((r) => r.id === task.residentId);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing ${
                            draggedTaskId === task.id
                              ? 'border-brand-500 ring-1 ring-brand-500 opacity-50'
                              : 'border-slate-200'
                          }`}
                          draggable={true}
                          onDragStart={(e) =>
                            handleDragStart(e as unknown as React.DragEvent, task.id)
                          }
                          onDragEnd={() => setDraggedTaskId(null)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}
                                >
                                  {task.category}
                                </span>
                              </div>
                              <h3 className="font-medium text-slate-900 text-sm">
                                {task.title}
                              </h3>
                            </div>

                            {isStaff && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-brand-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                            {task.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            {resident && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  {getFullName(resident)} (Rm {resident.room})
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span
                                className={
                                  new Date(task.dueDate) < new Date() &&
                                  task.status !== 'Done'
                                    ? 'text-red-600 font-medium'
                                    : ''
                                }
                              >
                                {new Date(task.dueDate).toLocaleDateString()}{' '}
                                {new Date(task.dueDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {assignedStaff ? (
                              <div
                                className="flex items-center gap-1.5"
                                title={`Assigned to ${getFullName(assignedStaff)}`}
                              >
                                <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-medium text-brand-700">
                                  {assignedStaff.firstName?.[0]}
                                  {assignedStaff.lastName?.[0]}
                                </div>
                                <span className="text-xs text-slate-600 truncate max-w-[80px]">
                                  {assignedStaff.firstName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Unassigned
                              </span>
                            )}

                            {isBranchAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {column !== 'Todo' && (
                                  <button
                                    onClick={() => void moveTask(task.id, 'Todo')}
                                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                    title="Move to Todo"
                                  >
                                    <Clock className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {column !== 'In Progress' && (
                                  <button
                                    onClick={() =>
                                      void moveTask(task.id, 'In Progress')
                                    }
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Move to In Progress"
                                  >
                                    <Activity className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {column !== 'Done' && (
                                  <button
                                    onClick={() => void moveTask(task.id, 'Done')}
                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Mark Done"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-400">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isStaff && selectedTask && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Task Details"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <p className="text-slate-900">{selectedTask.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <span
                className={`inline-flex text-xs px-2 py-1 rounded border ${getTaskCategoryColor(selectedTask.category)}`}
              >
                {selectedTask.category}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <p className="text-slate-600 text-sm">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resident
                </label>
                <p className="text-slate-600 text-sm">
                  {residents.find((r) => r.id === selectedTask.residentId)
                    ? getFullName(
                        residents.find(
                          (r) => r.id === selectedTask.residentId,
                        ) as Resident,
                      )
                    : 'None'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <p className="text-slate-600 text-sm">
                  {new Date(selectedTask.dueDate).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
