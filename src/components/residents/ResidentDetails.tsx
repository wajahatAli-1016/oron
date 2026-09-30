import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  HeartPulse,
  Heart,
  ClipboardList,
  Pill,
  MessageSquare,
  Activity,
  Plus,
  Edit2,
  Save,
  ShieldAlert,
  Target,
  Printer,
} from
  'lucide-react';
import { Card, Button, Badge, Input, Modal, FilterDropdown } from '../../components/UI';
import {
  // mockCarePlans,
} from
  '../../mockData';
import {
  CarePlan,
  CreateNoteRequest,
  getEmergencyContactDisplayName,
  getFullName,
  normalizeEmergencyContacts,
  Note,
  Resident,
  Task,
  Vital,
} from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from
  'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { MetadataBanner } from '../../components/care plans/MetadataBanner';
import { ClinicalAssessment } from '../../components/care plans/ClinicalAssessment';
import { RiskSafetyProfile } from '../../components/care plans/RiskSafetyProfile';
import { GoalsOfCare } from '../../components/care plans/GoalsOfCare';
import { PlannedInterventions } from '../../components/care plans/PlannedInterventions';
import { PersonCenteredPreferences } from '../../components/care plans/PersonCenteredPreferences';
import { CarePlanCreateSection } from '../../components/care plans/CarePlanCreateSection';
import { carePlanService } from '../../services/carePlanService';
import { clinicalAssessmentService } from '../../services/clinicalAssessmentService';
import { riskProfileService } from '../../services/riskProfileService';
import { goalsService } from '../../services/goalsService';
import { interventionsService } from '../../services/interventionsService';
import { preferencesService } from '../../services/preferencesService';
import { notesService } from '../../services/notesService';
import { vitalService } from '../../services/vitalService';
import { taskService } from '../../services/taskService';
import {
  useGetBranchByIdQuery,
  useGetFacilityByIdQuery,
  useGetResidentByIdQuery,
} from '../../store/api/oronApi';
import { ResidentDetailsSkeleton } from '../skeletons/DetailsSkeleton';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { formatHeightAsCm, parseCommaList } from '../../utils/height';
import { useToast } from '../../context/ToastContext';
import { fetchCarePlanReportSections } from '../../components/care plans/carePlanReportData';
import { exportCarePlanReport } from '../../components/care plans/carePlanReportGenerator';

/** Tabs for viewing saved notes by type (order: Clinical → General → Observation). */
const NOTES_LIST_TAB_ORDER: Note['type'][] = ['Clinical', 'General', 'Observation'];

export const ResidentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const hasRetriedPhotoRef = useRef(false);

  // Get the active tab from location state (if coming from care plans)
  const [activeTab, setActiveTab] = useState(() => {
    const state = location.state as { activeTab?: string };
    if (state?.activeTab === 'careplan') {
      return 'careplan';
    }
    return 'overview';
  });

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<Note['type']>('Observation');
  const [notesListTab, setNotesListTab] = useState<Note['type']>('Clinical');
  const [isLoggingVitals, setIsLoggingVitals] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [, setResidentTasks] = useState<Task[]>([]);

  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const [carePlanError, setCarePlanError] = useState<string | null>(null);
  const [showCarePlanCreate, setShowCarePlanCreate] = useState(false);
  const [showCarePlanEdit, setShowCarePlanEdit] = useState(false);
  const [carePlanMutating, setCarePlanMutating] = useState(false);
  const [carePlanReportLoading, setCarePlanReportLoading] = useState(false);
  const [isDeleteCarePlanModalOpen, setIsDeleteCarePlanModalOpen] = useState(false);
  const [clinicalAssessmentExists, setClinicalAssessmentExists] = useState(false);
  const [showClinicalAssessment, setShowClinicalAssessment] = useState(false);
  const [startClinicalAssessmentEditing, setStartClinicalAssessmentEditing] = useState(false);
  const [riskProfileExists, setRiskProfileExists] = useState(false);
  const [showRiskProfile, setShowRiskProfile] = useState(false);
  const [startRiskProfileEditing, setStartRiskProfileEditing] = useState(false);
  const [goalsExist, setGoalsExist] = useState(false);
  const [showGoalsOfCare, setShowGoalsOfCare] = useState(false);
  const [startGoalsEditing, setStartGoalsEditing] = useState(false);
  const [interventionsExist, setInterventionsExist] = useState(false);
  const [showPlannedInterventions, setShowPlannedInterventions] = useState(false);
  const [startInterventionsEditing, setStartInterventionsEditing] = useState(false);
  const [preferencesExist, setPreferencesExist] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [startPreferencesEditing, setStartPreferencesEditing] = useState(false);
  const [carePlanSubTab, setCarePlanSubTab] = useState<
    'clinical' | 'risk' | 'goals' | 'interventions' | 'preferences'
  >('clinical');
  const [vitalsPeriodDays, setVitalsPeriodDays] = useState('7');

  const vitalsPeriodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
  ];

  const {
    data: resident,
    isLoading: residentLoading,
    isError: residentIsError,
    error: residentFetchError,
    refetch: refetchResident,
  } = useGetResidentByIdQuery(id!, { skip: !id });

  const { data: branch } = useGetBranchByIdQuery(resident?.branchId ?? '', {
    skip: !resident?.branchId,
  });
  const { data: facilityRow } = useGetFacilityByIdQuery(resident?.facilityId ?? '', {
    skip: !resident?.facilityId,
  });
  const branchName = branch?.name ?? '';
  const facilityName = facilityRow?.name ?? '';

  const isPageLoading = (!!id && residentLoading) || extrasLoading;

  const fullName = useMemo(() => (resident ? getFullName(resident) : ''), [resident]);
  const heightCmDisplay = useMemo(
    () => (resident?.height ? formatHeightAsCm(resident.height) : null),
    [resident?.height],
  );
  const diagnosisBadges = useMemo(
    () => parseCommaList(resident?.primaryDiagnosis ?? ''),
    [resident?.primaryDiagnosis],
  );
  const allergyBadges = useMemo(
    () => parseCommaList(resident?.allergies ?? ''),
    [resident?.allergies],
  );
  const emergencyContacts = useMemo(
    () => normalizeEmergencyContacts(resident?.emergencyContacts),
    [resident?.emergencyContacts],
  );
  const carePlan = useMemo(() => carePlans[0], [carePlans]);
  const canManage = useMemo(
    () => user?.role === 'facility_admin' || user?.role === 'admin',
    [user?.role],
  );
  const canManageCarePlans = canManage;
  const canManageClinicalAssessment = canManage;
  const canManageRiskProfile = canManage;
  const canManageGoals = canManage;
  const canManageInterventions = canManage;
  const canManagePreferences = canManage;

  const notesCountByType = useMemo(() => {
    const counts: Record<Note['type'], number> = {
      Clinical: 0,
      General: 0,
      Observation: 0,
    };
    for (const n of notes) {
      counts[n.type]++;
    }
    return counts;
  }, [notes]);

  const filteredNotesForListTab = useMemo(
    () => notes.filter((n) => n.type === notesListTab),
    [notes, notesListTab],
  );

  const refreshCarePlans = useCallback(async () => {
    if (!id) return;
    setCarePlanLoading(true);
    setCarePlanError(null);
    try {
      const plans = await carePlanService.getCarePlansByResident(id);
      setCarePlans(plans);
    } catch (err) {
      setCarePlanError(err instanceof Error ? err.message : 'Failed to load care plan');
    } finally {
      setCarePlanLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError('Resident ID is missing');
      setExtrasLoading(false);
      return;
    }

    setError(null);
    setExtrasLoading(true);
    void Promise.all([
      vitalService.getVitalsByResident(id),
      taskService.getAllTasks(),
      notesService.getNotesByResidentId(id),
    ])
      .then(([vitalsData, allTasks, notesData]) => {
        setVitals(
          [...vitalsData].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          ),
        );
        setResidentTasks(allTasks.filter((task) => task.residentId === id));
        setNotes(notesData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load resident details');
      })
      .finally(() => {
        setExtrasLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!resident?.id) return;
    sessionStorage.setItem(
      `breadcrumb:residents:${resident.id}`,
      getFullName(resident),
    );
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [resident]);

  useEffect(() => {
    if (!id) return;
    void refreshCarePlans();
  }, [id, refreshCarePlans]);

  useEffect(() => {
    if (!id) return;
    clinicalAssessmentService
      .getByResident(id)
      .then((rows) => {
        const exists = (rows?.length ?? 0) > 0;
        setClinicalAssessmentExists(exists);
        if (exists) setShowClinicalAssessment(true);
      })
      .catch(() => {
        setClinicalAssessmentExists(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    riskProfileService
      .getByResident(id)
      .then((rows) => {
        const exists = (rows?.length ?? 0) > 0;
        setRiskProfileExists(exists);
        if (exists) setShowRiskProfile(true);
      })
      .catch(() => {
        setRiskProfileExists(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    goalsService
      .getByResident(id)
      .then((rows) => {
        const exists = (rows?.length ?? 0) > 0;
        setGoalsExist(exists);
        if (exists) setShowGoalsOfCare(true);
      })
      .catch(() => {
        setGoalsExist(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    interventionsService
      .getByResident(id)
      .then((rows) => {
        const exists = (rows?.length ?? 0) > 0;
        setInterventionsExist(exists);
        if (exists) setShowPlannedInterventions(true);
      })
      .catch(() => {
        setInterventionsExist(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    preferencesService
      .getByResident(id)
      .then((rows) => {
        const exists = (rows?.length ?? 0) > 0;
        setPreferencesExist(exists);
        if (exists) setShowPreferences(true);
      })
      .catch(() => {
        setPreferencesExist(false);
      });
  }, [id]);

  useEffect(() => {
    // reset creation/edit state when we have an active care plan
    if (carePlan) {
      setShowCarePlanCreate(false);
      setShowCarePlanEdit(false);
    }
  }, [carePlan?.id]);

  useEffect(() => {
    if (clinicalAssessmentExists) {
      setStartClinicalAssessmentEditing(false);
    }
  }, [clinicalAssessmentExists]);

  useEffect(() => {
    if (riskProfileExists) {
      setStartRiskProfileEditing(false);
    }
  }, [riskProfileExists]);

  useEffect(() => {
    if (goalsExist) {
      setStartGoalsEditing(false);
    }
  }, [goalsExist]);

  useEffect(() => {
    if (interventionsExist) {
      setStartInterventionsEditing(false);
    }
  }, [interventionsExist]);

  useEffect(() => {
    if (preferencesExist) {
      setStartPreferencesEditing(false);
    }
  }, [preferencesExist]);

  const handleDeleteCarePlan = useCallback(async () => {
    if (!carePlan) return;

    setCarePlanMutating(true);
    setCarePlanError(null);
    try {
      await carePlanService.deleteCarePlan(carePlan.id);
      setIsDeleteCarePlanModalOpen(false);
      await refreshCarePlans();
    } catch (err) {
      setCarePlanError(err instanceof Error ? err.message : 'Failed to delete care plan');
    } finally {
      setCarePlanMutating(false);
    }
  }, [carePlan, refreshCarePlans]);

  const handleAcknowledgeCarePlan = useCallback(async () => {
    if (!carePlan) return;
    if (!confirm('Acknowledge & sign this care plan?')) return;

    setCarePlanMutating(true);
    setCarePlanError(null);
    try {
      await carePlanService.updateCarePlan(carePlan.id, { signed: true });
      await refreshCarePlans();
    } catch (err) {
      setCarePlanError(err instanceof Error ? err.message : 'Failed to acknowledge care plan');
    } finally {
      setCarePlanMutating(false);
    }
  }, [carePlan, refreshCarePlans]);

  const handlePrintCarePlanReport = useCallback(async () => {
    if (!resident || !carePlan) return;
    setCarePlanReportLoading(true);
    try {
      const sections = await fetchCarePlanReportSections(resident.id);
      await exportCarePlanReport({
        residentName: fullName,
        facilityName,
        branchName,
        carePlan,
        sections,
        generatedAt: new Date().toISOString(),
      });
      toast.success('Care plan report downloaded as PDF.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate care plan report';
      toast.error(message);
    } finally {
      setCarePlanReportLoading(false);
    }
  }, [resident, carePlan, fullName, facilityName, branchName, toast]);

  //create note
  const handleCreateNote = async () => {
    if (!newNote.trim() || !id || !user) return;

    setLoading(true);
    try {
      const createRequest: CreateNoteRequest = {
        residentId: id,
        author: getFullName(user as any), // Assuming user has firstName and lastName
        content: newNote.trim(),
        type: noteType,
      };

      const createdNote = await notesService.createNote(createRequest);
      setNotes(prev => [createdNote, ...prev]);
      setNotesListTab(createdNote.type);
      setNewNote('');
      setNoteType('Observation');
    } catch (error) {
      console.error('Failed to create note:', error);
      setError(error instanceof Error ? error.message : 'Failed to create note');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setLoading(true);
    try {
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete note');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate age
  const getAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
      age--;
    }
    return age;
  };

  // Format vitals for chart (reverse to show chronological order left to right)
  const chartData = useMemo(() => {
    const days = vitalsPeriodDays === '30' ? 30 : 7;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    return [...vitals]
      .filter((v) => {
        const dt = new Date(v.date);
        return !Number.isNaN(dt.getTime()) && dt >= since;
      })
      .reverse()
      .map((v) => ({
      date: new Date(v.date).toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      }),
      systolic: v.systolicBP,
      diastolic: v.diastolicBP,
      heartRate: v.heartRate
    }));
  }, [vitals, vitalsPeriodDays]);

  const tabs = useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview',
        icon: User
      },
      {
        id: 'vitals',
        label: 'Vitals History',
        icon: Activity
      },
      {
        id: 'careplan',
        label: 'Care Plan',
        icon: ClipboardList
      },
      {
        id: 'medications',
        label: 'Medications',
        icon: Pill
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: MessageSquare
      }
    ],
    [],
  );

  // Rest of your component remains exactly the same...
  // (All the helper functions and JSX remain unchanged)

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'Clinical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isPageLoading) {
    return <ResidentDetailsSkeleton activeTab={activeTab} />;
  }
  if (!resident) {
    return (
      <div className="space-y-6 overflow-x-hidden">
        <Card>
          <p className="text-sm text-red-600">
            {residentIsError
              ? getApiErrorMessage(residentFetchError, 'Failed to load resident')
              : error || 'Resident not found'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
        <Link
          to={`/${user?.role === 'owner' ? 'owner/facilities' : user?.role === 'facility_admin' ? 'facility-admin/residents' : user?.role === 'staff' ? 'staff/residents' : 'admin/residents'}`}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
            <img
              src={resident.photoUrl ? resident.photoUrl : `https://i.pravatar.cc/150?u=${resident.id}`}
              alt={fullName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Signed URLs can expire. Retry once by refetching the resident (backend returns a fresh signed URL).
                if (!id || !resident.photoUrl || hasRetriedPhotoRef.current) {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerText = `${resident.firstName[0]}${resident.lastName[0]}`;
                  return;
                }

                hasRetriedPhotoRef.current = true;
                void refetchResident()
                  .then((result) => {
                    const fresh = result.data;
                    if (fresh?.photoUrl) {
                      e.currentTarget.style.display = '';
                      e.currentTarget.src = fresh.photoUrl;
                    }
                  })
                  .catch(() => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerText = `${resident.firstName[0]}${resident.lastName[0]}`;
                  });
              }} />

          </div>
          <div>
            <div className="flex flex-col  md:flex-row items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
              <Badge
                variant={
                  resident.status === 'InPatient' ?
                    'success' :
                    resident.status === 'Hospitalized' ?
                      'warning' :
                      'default'
                }>

                {resident.status}
              </Badge>
              
              <Badge
              variant={resident.healthState === 'Stable' ? 'success' : resident.healthState === 'Slight Deviation' ? 'warning' : resident.healthState === 'Concerning Trend' ? 'danger' : resident.healthState === 'Early Deterioration' ? 'danger' : resident.healthState === 'Active Deterioration' ? 'danger' : resident.healthState === 'Recovery' ? 'success' : 'default'}
              >
                {resident.healthState}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              {getAge(resident.dob)} years old • {resident.gender} • Room{' '}
              {resident.room}
              {(facilityName || branchName) && (
                <>
                  {' '}
                  • {facilityName || '—'} • {branchName || '—'}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            icon={Edit2}
            onClick={() => {
              if (!id) return;
              if (user?.role === 'staff') return;
              const basePath = user?.role === 'admin' ? '/admin' : '/facility-admin';
              navigate(`${basePath}/residents/${id}/edit`);
            }}>

            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b w-full  border-slate-200 overflow-x-auto scrollbar-hide">
        <div className=" w-[400px]  md:w-full ">
          <nav className="flex gap-6 w-[400px] w-full">
            {tabs.map((tab) =>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>

                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' &&
            <motion.div
              key="overview"
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-slate-400" /> Personal
                    Information
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Date of Birth
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {new Date(resident.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Admission Date
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {new Date(resident.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                    {resident.weight != null && resident.weight > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Weight
                        </p>
                        <p className="text-sm text-slate-900 mt-0.5">
                          {resident.weight} lbs
                        </p>
                      </div>
                    )}
                    {heightCmDisplay && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Height
                        </p>
                        <p className="text-sm text-slate-900 mt-0.5">
                          {heightCmDisplay}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-slate-400" /> Medical
                    Summary
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1.5">
                        Primary Diagnosis
                      </p>
                      {diagnosisBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {diagnosisBadges.map((item, index) => (
                            <Badge
                              key={`${item}-${index}`}
                              variant="default"
                              className="bg-white text-slate-700 border-slate-200"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">None recorded</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1.5">
                        Allergies
                      </p>
                      {allergyBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {allergyBadges.map((item, index) => (
                            <Badge
                              key={`${item}-${index}`}
                              variant="danger"
                              className="bg-red-100 text-red-700 border-red-200"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No known allergies</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Medical History
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {resident.medicalHistory}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-slate-400" /> Emergency
                    Contacts
                  </h2>
                  <div className="space-y-3">
                    {emergencyContacts.length > 0 ? (
                      emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">

                        <div>
                          <p className="font-medium text-slate-900">
                            {getEmergencyContactDisplayName(contact)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {contact.relation || '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            {contact.phone || '—'}
                          </p>
                          {contact.email ? (
                            <p className="text-sm text-slate-500">{contact.email}</p>
                          ) : null}
                        </div>
                      </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No emergency contacts recorded.</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-brand-50 border-brand-100">
                  <h2 className="text-sm font-semibold text-brand-900 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-600" /> Latest
                    Vitals
                  </h2>
                  {vitals.length > 0 ?
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">
                          Blood Pressure
                        </span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].systolicBP}/{vitals[0].diastolicBP}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">
                          Heart Rate
                        </span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].heartRate} bpm
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">SpO2</span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].oxygenSaturation}%
                        </span>
                      </div>
                      <div className="pt-3 border-t border-brand-200/50 text-right">
                        <span className="text-[10px] text-brand-600">
                          Recorded{' '}
                          {new Date(vitals[0].date).toLocaleDateString()}
                        </span>
                      </div>
                    </div> :

                    <p className="text-sm text-brand-700">
                      No vitals recorded yet.
                    </p>
                  }
                </Card>
              </div>
            </motion.div>
          }

          {activeTab === 'vitals' &&
            <motion.div
              key="vitals"
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className="space-y-6">

              {isLoggingVitals ?
                <Card className="border-brand-200 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-brand-500" /> Record
                      New Vitals
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLoggingVitals(false)}>

                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Blood Pressure
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="120"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />

                        <span className="text-slate-400 text-lg">/</span>
                        <input
                          type="number"
                          placeholder="80"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />

                        <span className="text-xs text-slate-500 ml-1">
                          mmHg
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Heart Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="72"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-12" />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          bpm
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Temperature
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="98.6"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-10" />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          °F
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Oxygen Saturation (SpO2)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="98"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-8" />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      icon={Save}
                      onClick={() => setIsLoggingVitals(false)}>

                      Save Vitals
                    </Button>
                  </div>
                </Card> :

                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Vitals Trends
                    </h2>
                    <FilterDropdown
                      value={vitalsPeriodDays}
                      onChange={setVitalsPeriodDays}
                      options={vitalsPeriodOptions}
                      ariaLabel="Vitals chart period"
                      minWidth="9.5rem"
                      showCountsInMenu={false}
                      placement="bottom-end"
                    />
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 20,
                          bottom: 5,
                          left: 0
                        }}>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E2E8F0" />

                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#64748B',
                            fontSize: 12
                          }} />

                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#64748B',
                            fontSize: 12
                          }}
                          domain={['dataMin - 10', 'dataMax + 10']} />

                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#64748B',
                            fontSize: 12
                          }}
                          domain={['dataMin - 10', 'dataMax + 10']} />

                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} />

<Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-[12px] text-slate-600">{value}</span>
                  )}
                />

                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="systolic"
                          name="Systolic BP"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={{
                            r: 4
                          }}
                          activeDot={{
                            r: 6
                          }} />

                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="diastolic"
                          name="Diastolic BP"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{
                            r: 4
                          }}
                          activeDot={{
                            r: 6
                          }} />

                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="heartRate"
                          name="Heart Rate"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{
                            r: 4
                          }}
                          activeDot={{
                            r: 6
                          }} />

                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              }

              <Card noPadding>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Vitals Log
                  </h2>
                  <Button
                    size="sm"
                    icon={Plus}
                    onClick={() => setIsLoggingVitals(true)}>

                    Log Vitals
                  </Button>
                </div>
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-0 text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3 font-medium">Date & Time</th>
                          <th className="px-5 py-3 font-medium">BP</th>
                          <th className="px-5 py-3 font-medium">HR</th>
                          <th className="px-5 py-3 font-medium">Temp</th>
                          <th className="px-5 py-3 font-medium">SpO2</th>
                          <th className="px-5 py-3 font-medium">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vitals.map((v) =>
                          <tr key={v.id} className="hover:bg-slate-50/50">
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="font-medium text-slate-900">
                                {new Date(v.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(v.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-900">
                              {v.systolicBP}/{v.diastolicBP}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {v.heartRate}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {v.temperature}°F
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {v.oxygenSaturation}%
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {v.recordedBy?.trim() || '—'}
                            </td>
                          </tr>
                        )}
                        {vitals.length === 0 &&
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-8 text-center text-slate-500">

                              No vitals recorded yet.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                </div>
              </Card>
            </motion.div>
          }

{activeTab === 'careplan' && (
  <motion.div
    key="careplan"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {carePlanLoading ? (
      <Card className="py-10 text-center text-slate-500">Loading care plan…</Card>
    ) : carePlanError ? (
      <Card className="py-10 text-center">
        <h3 className="text-lg font-medium text-slate-900">Unable to load care plan</h3>
        <p className="text-sm text-slate-500 mt-1">{carePlanError}</p>
      </Card>
    ) : carePlan ? (
      <div className="space-y-6">
        {/* METADATA BANNER – NEW */}
        <MetadataBanner
          carePlan={carePlan}
          canManage={canManageCarePlans}
          isMutating={carePlanMutating}
          onEdit={canManageCarePlans ? () => setShowCarePlanEdit((v) => !v) : undefined}
          onDelete={canManageCarePlans ? () => setIsDeleteCarePlanModalOpen(true) : undefined}
          onAcknowledge={canManageCarePlans ? handleAcknowledgeCarePlan : undefined}
        />

        <div className="flex justify-end no-print">
          <Button
            variant="outline"
            icon={Printer}
            onClick={() => void handlePrintCarePlanReport()}
            isLoading={carePlanReportLoading}
            disabled={carePlanReportLoading}
          >
            Print Report
          </Button>
        </div>

        {canManageCarePlans && showCarePlanEdit && (
          <CarePlanCreateSection
            resident={resident}
            facilityName={facilityName}
            branchName={branchName}
            mode="edit"
            carePlan={carePlan}
            onCancel={() => setShowCarePlanEdit(false)}
            onSaved={async () => {
              setShowCarePlanEdit(false);
              await refreshCarePlans();
            }}
          />
        )}

        {/* Care Plan Sub Tabs */}
        <Card className="py-2">
          <nav className="flex flex-wrap gap-2">
            {(
              [
                { id: 'clinical', label: 'Clinical', icon: ClipboardList },
                { id: 'risk', label: 'Risk & Safety', icon: ShieldAlert },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'interventions', label: 'Interventions', icon: Activity },
                { id: 'preferences', label: 'Preferences', icon: Heart },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCarePlanSubTab(t.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  carePlanSubTab === t.id
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Empty-state helper */}
        {(() => {
          const EmptyState = ({
            icon: Icon,
            title,
            description,
            canCreate,
            onCreate,
            buttonText,
          }: {
            icon: React.ComponentType<{ className?: string }>;
            title: string;
            description: string;
            canCreate: boolean;
            onCreate?: () => void;
            buttonText: string;
          }) => {
            return (
              <Card className="py-10 text-center">
                <Icon className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>
                {canCreate && onCreate && (
                  <div className="flex justify-center">
                    <Button icon={Plus} onClick={onCreate}>
                      {buttonText}
                    </Button>
                  </div>
                )}
              </Card>
            );
          };

          if (carePlanSubTab === 'clinical') {
            if (!clinicalAssessmentExists && !showClinicalAssessment) {
              return (
                <EmptyState
                  icon={ClipboardList}
                  title="Clinical & Functional Assessment"
                  description="No clinical assessment has been created for this resident yet."
                  canCreate={canManageClinicalAssessment}
                  buttonText="Create Clinical Assessment"
                  onCreate={() => {
                    setShowClinicalAssessment(true);
                    setStartClinicalAssessmentEditing(true);
                  }}
                />
              );
            }
            return (
              <ClinicalAssessment
                residentId={resident.id}
                canManage={canManageClinicalAssessment}
                isVisible={true}
                startEditing={startClinicalAssessmentEditing}
                onExistsChange={(exists) => setClinicalAssessmentExists(exists)}
              />
            );
          }

          if (carePlanSubTab === 'risk') {
            if (!riskProfileExists && !showRiskProfile) {
              return (
                <EmptyState
                  icon={ShieldAlert}
                  title="Risk & Safety Profile"
                  description="No risk & safety profile has been created for this resident yet."
                  canCreate={canManageRiskProfile}
                  buttonText="Create Risk & Safety Profile"
                  onCreate={() => {
                    setShowRiskProfile(true);
                    setStartRiskProfileEditing(true);
                  }}
                />
              );
            }
            return (
              <RiskSafetyProfile
                residentId={resident.id}
                canManage={canManageRiskProfile}
                isVisible={true}
                startEditing={startRiskProfileEditing}
                onExistsChange={(exists) => setRiskProfileExists(exists)}
              />
            );
          }

          if (carePlanSubTab === 'goals') {
            if (!goalsExist && !showGoalsOfCare) {
              return (
                <EmptyState
                  icon={Target}
                  title="Goals of Care"
                  description="No goals have been created for this resident yet."
                  canCreate={canManageGoals}
                  buttonText="Create Goals of Care"
                  onCreate={() => {
                    setShowGoalsOfCare(true);
                    setStartGoalsEditing(true);
                  }}
                />
              );
            }
            return (
              <GoalsOfCare
                residentId={resident.id}
                branchId={resident.branchId}
                canManage={canManageGoals}
                isVisible={true}
                startEditing={startGoalsEditing}
                onExistsChange={(exists) => setGoalsExist(exists)}
              />
            );
          }

          if (carePlanSubTab === 'interventions') {
            if (!interventionsExist && !showPlannedInterventions) {
              return (
                <EmptyState
                  icon={Activity}
                  title="Planned Interventions"
                  description="No planned interventions have been created for this resident yet."
                  canCreate={canManageInterventions}
                  buttonText="Create Planned Interventions"
                  onCreate={() => {
                    setShowPlannedInterventions(true);
                    setStartInterventionsEditing(true);
                  }}
                />
              );
            }
            return (
              <PlannedInterventions
                residentId={resident.id}
                canManage={canManageInterventions}
                isVisible={true}
                startEditing={startInterventionsEditing}
                onExistsChange={(exists) => setInterventionsExist(exists)}
              />
            );
          }

          if (carePlanSubTab === 'preferences') {
            if (!preferencesExist && !showPreferences) {
              return (
                <EmptyState
                  icon={Heart}
                  title="Person Centered Preferences"
                  description="No preferences have been created for this resident yet."
                  canCreate={canManagePreferences}
                  buttonText="Create Person Centered Preferences"
                  onCreate={() => {
                    setShowPreferences(true);
                    setStartPreferencesEditing(true);
                  }}
                />
              );
            }
            return (
              <PersonCenteredPreferences
                residentId={resident.id}
                canManage={canManagePreferences}
                isVisible={true}
                startEditing={startPreferencesEditing}
                onExistsChange={(exists) => setPreferencesExist(exists)}
              />
            );
          }

          return null;
        })()}

      </div>
    ) : canManageCarePlans && showCarePlanCreate ? (
      <CarePlanCreateSection
        resident={resident}
        facilityName={facilityName}
        branchName={branchName}
        mode="create"
        onCancel={() => setShowCarePlanCreate(false)}
        onSaved={async () => {
          setShowCarePlanCreate(false);
          await refreshCarePlans();
        }}
      />
    ) : (
      <Card className="text-center py-12">
        <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-medium text-slate-900">No Active Care Plan</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          A care plan has not been generated for this resident yet.
        </p>
        {canManageCarePlans && (
          <div className="flex justify-center">
            <Button type="button" onClick={() => setShowCarePlanCreate(true)}>
              Create Care Plan
            </Button>
          </div>
        )}
      </Card>
    )}
  </motion.div>
)}

          {activeTab === 'medications' &&
            <motion.div
              key="medications"
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}>

              <Card noPadding>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Current Medications
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 font-medium">Medication</th>
                        <th className="px-5 py-3 font-medium">Dosage</th>
                        <th className="px-5 py-3 font-medium">Schedule</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {carePlan?.medications.map((med, idx) =>
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-brand-500" />
                              <span className="font-medium text-slate-900">
                                {med.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {med.dosage}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {med.schedule}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                med.status === 'Active' ?
                                  'success' :
                                  med.status === 'Paused' ?
                                    'warning' :
                                    'default'
                              }>

                              {med.status}
                            </Badge>
                          </td>
                        </tr>
                      )}
                      {(!carePlan || carePlan.medications.length === 0) &&
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-8 text-center text-slate-500">

                            No medications recorded.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          }


          {activeTab === 'notes' &&
            <motion.div
              key="notes"
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className="space-y-6">

              <Card>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Add Note
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-2 mb-2">
                    {(['Observation', 'Clinical', 'General'] as const).map((type) =>
                      <button
                        key={type}
                        onClick={() => setNoteType(type)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${noteType === type ? getNoteTypeColor(type) : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>

                        {type}
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
                    placeholder="Type your observation or note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}>
                  </textarea>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreateNote}
                      disabled={!newNote.trim() || loading}
                      isLoading={loading}
                    >
                      {loading ? 'Saving...' : 'Save Note'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Notes List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-slate-500">Loading notes...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 border-b border-slate-200 pb-1 sm:flex-row sm:items-center sm:gap-4">
                    <p className="text-sm font-semibold text-slate-900 shrink-0">Notes</p>
                    <nav
                      className="flex flex-wrap gap-1 justify-start"
                      aria-label="Filter notes by type"
                    >
                      {NOTES_LIST_TAB_ORDER.map((tabType) => (
                        <button
                          key={tabType}
                          type="button"
                          onClick={() => setNotesListTab(tabType)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                            notesListTab === tabType
                              ? 'border-brand-200 bg-brand-50 text-brand-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {tabType}
                          <span className="ml-1 tabular-nums text-slate-500">
                            ({notesCountByType[tabType]})
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {filteredNotesForListTab.map((note) => (
                    <Card
                      key={note.id}
                      className="hover:border-slate-300 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                            {note.author.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {note.author}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getNoteTypeColor(note.type)}`}>
                            {note.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {new Date(note.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {/* Optional: Add delete button */}
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 pl-8">
                        {note.content}
                      </p>
                    </Card>
                  ))}

                  {notes.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No notes yet. Create your first note above.
                    </div>
                  )}
                  {notes.length > 0 && filteredNotesForListTab.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No {notesListTab.toLowerCase()} notes yet. Add one above or switch tabs.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          }
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Resident Profile">

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" defaultValue={resident.firstName} />
            <Input label="Last Name" defaultValue={resident.lastName} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Room Number" defaultValue={resident.room} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={resident.status}>

                <option>InPatient</option>
                <option>Hospitalized</option>
                <option>Discharged</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Code Status
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="">Select Code Status</option>
              <option>Full Code</option>
              <option>DNR</option>
              <option>DNI</option>
              <option>DNR/DNI</option>
              <option>Comfort Care</option>
            </select>
          </div>
          <Input
            label="Primary Diagnosis"
            defaultValue={resident.primaryDiagnosis} />

          <Input label="Allergies" defaultValue={resident.allergies} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}>

              Cancel
            </Button>
            <Button onClick={() => setIsEditProfileOpen(false)}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteCarePlanModalOpen}
        onClose={() => setIsDeleteCarePlanModalOpen(false)}
        title="Delete Care Plan">
        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">This action cannot be undone</p>
              <p className="mt-1">
                Deleting this care plan will remove all associated clinical data,
                goals, interventions, and preferences for this resident.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the care plan for{' '}
            <strong>{fullName}</strong>?
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteCarePlanModalOpen(false)}
              disabled={carePlanMutating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDeleteCarePlan()}
              isLoading={carePlanMutating}
              disabled={carePlanMutating}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title="Create New Task">

        <div className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Administer Morning Meds" />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option>Medication</option>
              <option>Bathing</option>
              <option>Vitals</option>
              <option>Therapy</option>
              <option>Observation</option>
              <option>Meal</option>
              <option>General</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Assign To
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="">Unassigned</option>
            </select>
          </div>
          <Input label="Due Date" type="datetime-local" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
              placeholder="Add any additional details or instructions...">
            </textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsCreateTaskOpen(false)}>

              Cancel
            </Button>
            <Button onClick={() => setIsCreateTaskOpen(false)}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

    </div>);

};