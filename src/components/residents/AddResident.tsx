import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  HeartPulse,
  Building2,
  Camera,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import type { CreateResidentRequest } from '../../services/residentService';
import {
  useCreateResidentMutation,
  useGetBranchesPaginatedQuery,
  useGetResidentByIdQuery,
  useUpdateResidentMutation,
} from '../../store/api/oronApi';
import { Branch, EmergencyContact, normalizeEmergencyContacts } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import {
  formatHeightDisplay,
  normalizeFeetHeightInput,
  parseHeightInput,
  parseHeightToInches,
  type HeightUnit,
} from '../../utils/height';

const parseCommaList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const joinCommaList = (items: string[]): string => items.join(', ');

type TagListInputProps = {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
  badgeVariant?: 'default' | 'danger';
};

const TagListInput = ({
  label,
  placeholder,
  items,
  onChange,
  badgeVariant = 'default',
}: TagListInputProps) => {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const value = draft.trim();
    if (!value) return;
    if (items.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...items, value]);
    setDraft('');
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
        />
        <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addItem}>
          Add
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant={badgeVariant}
              className={
                badgeVariant === 'danger'
                  ? 'gap-1 pr-1 bg-red-100 text-red-700 border-red-200'
                  : 'gap-1 pr-1 bg-white text-slate-700 border-slate-200'
              }
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-500"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

const defaultResidentForm: Omit<CreateResidentRequest, 'emergencyContacts'> = {
  branchId: '',
  facilityId: '',
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  gender: '',
  room: '',
  status: 'InPatient',
  healthState: 'Stable',
  admissionDate: new Date().toISOString().split('T')[0],
  weight: 0,
  height: '',
  medicalHistory: '',
  allergies: '',
  primaryDiagnosis: '',
  lastVitalsDate: '',
};

const createContactId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
};

const defaultContact: EmergencyContact = {
  id: createContactId(),
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  relation: '',
  email: '',
};

export const AddRes = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { id: residentId } = useParams();
  const isEditMode = Boolean(residentId);
  const [formData, setFormData] = useState(defaultResidentForm);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    defaultContact,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [residentPhoto, setResidentPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ft');
  const [heightInput, setHeightInput] = useState('');
  const [diagnosisItems, setDiagnosisItems] = useState<string[]>([]);
  const [allergyItems, setAllergyItems] = useState<string[]>([]);

  const role = user?.role;
  const basePath = role === 'admin' ? '/admin' : '/facility-admin';

  const pageTitle = useMemo(() => (isEditMode ? 'Edit Resident' : 'Add New Resident'), [isEditMode]);
  const pageDescription = useMemo(
    () => (isEditMode ? 'Update resident details and save changes.' : 'Enter resident details to create a new profile.'),
    [isEditMode],
  );

  const { data: branchesData } = useGetBranchesPaginatedQuery({ page: 1, limit: 500 });
  const branches = branchesData?.data ?? [];

  const {
    data: resident,
    isError: residentLoadFailed,
    error: residentLoadErr,
  } = useGetResidentByIdQuery(residentId!, {
    skip: !isEditMode || !residentId,
  });

  const [createResident] = useCreateResidentMutation();
  const [updateResident] = useUpdateResidentMutation();

  useEffect(() => {
    if (!resident) return;
    const storedInches = parseHeightToInches(resident.height ?? '');
    setFormData({
      branchId: resident.branchId,
      facilityId: resident.facilityId,
      firstName: resident.firstName ?? '',
      middleName: resident.middleName ?? '',
      lastName: resident.lastName ?? '',
      dob: resident.dob ?? '',
      gender: resident.gender ?? '',
      room: resident.room ?? '',
      status: resident.status ?? 'InPatient',
      healthState: resident.healthState ?? 'Stable',
      admissionDate: resident.admissionDate ?? new Date().toISOString().split('T')[0],
      weight: resident.weight ?? 0,
      height: storedInches !== null ? String(storedInches) : '',
      medicalHistory: resident.medicalHistory ?? '',
      allergies: resident.allergies ?? '',
      primaryDiagnosis: resident.primaryDiagnosis ?? '',
      lastVitalsDate: resident.lastVitalsDate ?? '',
    });
    setHeightUnit('ft');
    setHeightInput(
      storedInches !== null && storedInches > 0
        ? formatHeightDisplay(storedInches, 'ft')
        : '',
    );
    setDiagnosisItems(parseCommaList(resident.primaryDiagnosis ?? ''));
    setAllergyItems(parseCommaList(resident.allergies ?? ''));
    const loadedContacts = normalizeEmergencyContacts(resident.emergencyContacts);
    setEmergencyContacts(loadedContacts.length > 0 ? loadedContacts : [defaultContact]);

    if (resident.photoUrl) {
      const img = document.getElementById('preview-image') as HTMLImageElement | null;
      const icon = document.getElementById('placeholder-icon');
      if (img) {
        img.src = resident.photoUrl;
        img.classList.remove('hidden');
        if (icon) icon.classList.add('hidden');
      }
    }
  }, [resident]);

  useEffect(() => {
    if (!residentLoadFailed) return;
    const message = getApiErrorMessage(residentLoadErr, 'Unable to load resident for editing');
    setError(message);
    toast.error(message);
  }, [residentLoadFailed, residentLoadErr, toast]);

  const branchOptions = branches.filter(
    (branch) => !user?.facilityId || branch.facilityId === user.facilityId,
  );

  const currentBranch = branches.find((branch) => branch.id === user?.branchId);
  const branchDisplayName = currentBranch?.name || 'Assigned branch';

  useEffect(() => {
    const branchId = user?.branchId;
    if (role === 'admin' && branchId) {
      setFormData((prev) => ({ ...prev, branchId }));
    }
  }, [role, user?.branchId]);

  const setField = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setContactField = (
    id: string,
    field: keyof EmergencyContact,
    value: string,
  ) => {
    setEmergencyContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ),
    );
  };

  const addContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      {
        ...defaultContact,
        id: createContactId(),
      },
    ]);
  };

  const removeContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (formData.dob) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dob = new Date(formData.dob);
      dob.setHours(0, 0, 0, 0);
      if (dob.getTime() > today.getTime()) {
        const message = 'Date of birth cannot be in the future.';
        setError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }
    }

    const filledEmergencyContacts = emergencyContacts.filter(
      (contact) =>
        contact.firstName.trim() &&
        contact.lastName.trim() &&
        contact.phone.trim() &&
        contact.relation.trim(),
    );
    if (filledEmergencyContacts.length === 0) {
      const message =
        'Add at least one emergency contact with first name, last name, phone, and relationship.';
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    const heightInches = parseHeightInput(heightInput, heightUnit);
    if (heightInput.trim() && heightInches === null) {
      const message = 'Enter a valid height (no negative values).';
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    if (formData.weight < 0) {
      const message = 'Weight cannot be negative.';
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    const selectedBranch = branches.find((branch) => branch.id === formData.branchId);
    const payload: CreateResidentRequest = {
      ...formData,
      facilityId: selectedBranch?.facilityId || user?.facilityId || '',
      height: heightInches !== null ? String(heightInches) : '',
      weight: formData.weight,
      primaryDiagnosis: joinCommaList(diagnosisItems),
      allergies: joinCommaList(allergyItems),
      emergencyContacts: filledEmergencyContacts,
    };

    try {
      if (isEditMode && residentId) {
        await updateResident({
          id: residentId,
          body: payload,
          residentPhoto: residentPhoto ?? undefined,
        }).unwrap();
        setSuccess('Resident updated successfully.');
        toast.success('Resident updated successfully.');
      } else {
        await createResident({
          body: payload,
          residentPhoto: residentPhoto ?? undefined,
        }).unwrap();
        setSuccess('Resident created successfully.');
        toast.success('Resident created successfully.');
      }
      navigate(`${basePath}/residents`);
    } catch (err) {
      const message = getApiErrorMessage(err, isEditMode ? 'Unable to update resident' : 'Unable to create resident');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`${basePath}/residents`}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {pageTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pageDescription}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`${basePath}/residents`)}>
            Cancel
          </Button>
          <Button icon={Save} isLoading={isSubmitting} onClick={handleSubmit}>
            {isEditMode ? 'Save Changes' : 'Save Resident'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Quick Info */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center">
            <label className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 relative group cursor-pointer overflow-hidden">
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setResidentPhoto(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = document.getElementById(
                        'preview-image'
                      ) as HTMLImageElement;
                      const icon = document.getElementById('placeholder-icon');
                      if (img && e.target?.result) {
                        img.src = e.target.result as string;
                        img.classList.remove('hidden');
                        if (icon) icon.classList.add('hidden');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
              
              <img
                id="preview-image"
                className="h-full w-full object-cover hidden"
                alt="Preview" />
              
              <User
                id="placeholder-icon"
                className="h-12 w-12 text-slate-300" />
              
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-xs text-white font-medium">
                  Upload Photo
                </span>
              </div>
            </label>
            <h3 className="text-sm font-medium text-slate-900">
              Resident Photo
            </h3>
            <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 5MB</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-slate-400" />
              Branch Assignment
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Branch</label>
                {role === 'admin' ? (
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-700 cursor-not-allowed"
                    value={branchDisplayName}
                    disabled
                  />
                ) : (
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                    value={formData.branchId}
                    onChange={(e) => setField('branchId', e.target.value)}
                  >
                    <option value="">Select a branch</option>
                    {branchOptions.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name || branch.id}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <Input
                label="Room Number"
                placeholder="e.g. 101A"
                value={formData.room}
                onChange={(e) => setField('room', e.target.value)}
              />
              <Input
                label="Admission Date"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setField('admissionDate', e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={formData.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="InPatient">InPatient</option>
                  <option value="Hospitalized">Hospitalized</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="First Name *"
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
              />
              <Input
                label="Middle Name"
                placeholder="A."
                value={formData.middleName}
                onChange={(e) => setField('middleName', e.target.value)}
              />
              <Input
                label="Last Name *"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
              />

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setField('dob', e.target.value)}
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Gender</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                    value={formData.gender}
                    onChange={(e) => setField('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Weight (lbs)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    placeholder="150"
                    value={formData.weight || ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setField('weight', 0);
                        return;
                      }
                      const next = Number(raw);
                      if (Number.isNaN(next) || next < 0) return;
                      setField('weight', next);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Height</label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="heightUnit"
                        checked={heightUnit === 'ft'}
                        onChange={() => {
                          const inches = parseHeightInput(heightInput, heightUnit);
                          setHeightUnit('ft');
                          if (inches !== null) {
                            setHeightInput(formatHeightDisplay(inches, 'ft'));
                          }
                        }}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      Ft
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="heightUnit"
                        checked={heightUnit === 'in'}
                        onChange={() => {
                          const inches = parseHeightInput(heightInput, heightUnit);
                          setHeightUnit('in');
                          if (inches !== null) {
                            setHeightInput(formatHeightDisplay(inches, 'in'));
                          }
                        }}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      In
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder={heightUnit === 'ft' ? "5'6\" or 5 6" : 'e.g. 68'}
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    onBlur={() => {
                      if (heightUnit === 'ft' && heightInput.trim()) {
                        setHeightInput(normalizeFeetHeightInput(heightInput));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                  />
                  {/* {heightUnit === 'ft' && (
                    <p className="text-xs text-slate-500">
                      Enter feet and inches (e.g. 5 or 5 6). Stored as total inches in the database.
                    </p>
                  )} */}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Emergency Contacts
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addContact}>
                
                Add Contact
              </Button>
            </div>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={contact.id}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-lg relative"
                >
                  {emergencyContacts.length > 1 && (
                    <button
                      onClick={() => removeContact(contact.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Contact {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name *"
                      placeholder="First Name"
                      value={contact.firstName}
                      onChange={(e) => setContactField(contact.id, 'firstName', e.target.value)}
                    />
                    <Input
                      label="Middle Name"
                      placeholder="Middle Name"
                      value={contact.middleName}
                      onChange={(e) => setContactField(contact.id, 'middleName', e.target.value)}
                    />
                    <Input
                      label="Last Name *"
                      placeholder="Last Name"
                      value={contact.lastName}
                      onChange={(e) => setContactField(contact.id, 'lastName', e.target.value)}
                    />
                    <Input
                      label="Email"
                      placeholder="Email Address"
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => setContactField(contact.id, 'email', e.target.value)}
                    />
                    <Input
                      label="Phone Number *"
                      placeholder="(555) 000-0000"
                      value={contact.phone}
                      onChange={(e) => setContactField(contact.id, 'phone', e.target.value)}
                    />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">Relationship *</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                        value={contact.relation}
                        onChange={(e) => setContactField(contact.id, 'relation', e.target.value)}
                      >
                        <option value="">Select Relationship</option>
                        <option>Spouse</option>
                        <option>Son</option>
                        <option>Daughter</option>
                        <option>Sibling</option>
                        <option>Friend</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <HeartPulse className="h-4 w-4 text-slate-400" />
              Medical Summary
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Health State</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={formData.healthState}
                  onChange={(e) => setField('healthState', e.target.value)}
                >
                  <option value="Stable">Stable</option>
                  <option value="Slight Deviation">Slight Deviation</option>
                  <option value="Concerning Trend">Concerning Trend</option>
                  <option value="Early Deterioration">Early Deterioration</option>
                  <option value="Active Deterioration">Active Deterioration</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </div>
              <TagListInput
                label="Primary Diagnosis"
                placeholder="e.g. Dementia"
                items={diagnosisItems}
                onChange={setDiagnosisItems}
              />

              <TagListInput
                label="Allergies"
                placeholder="e.g. Penicillin"
                items={allergyItems}
                onChange={setAllergyItems}
                badgeVariant="danger"
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Medical History & Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px] resize-y"
                  placeholder="Enter relevant medical history, previous surgeries, and special instructions..."
                  value={formData.medicalHistory}
                  onChange={(e) => setField('medicalHistory', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};