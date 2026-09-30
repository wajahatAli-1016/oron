import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  FileText,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from
  'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateFacilityRequest, UpdateFacilityRequest } from '../../services/facilityService';
import {
  useCreateFacilityMutation,
  useGetFacilityByIdQuery,
  useGetUserByIdQuery,
  useUpdateFacilityMutation,
} from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage, getApiSuccessMessage } from '../../utils/apiMessage';
import { PdfThumbnail } from '../common/PdfThumbnail';
import { FacilityOnboardingStepSkeleton } from '../skeletons/FacilityEditSkeleton';

type EditBaseline = {
  formData: CreateFacilityRequest;
  contractDocumentUrl: string | null;
};

const EDIT_FORM_KEYS: (keyof CreateFacilityRequest)[] = [
  'name',
  'phone',
  'email',
  'type',
  'status',
  'contractStart',
  'contractEnd',
  'adminFirstName',
  'adminLastName',
  'adminEmail',
];

export const FacilityOnboarding = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id: facilityId } = useParams();
  const isEditMode = Boolean(facilityId);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateFacilityRequest>({
    name: '',
    phone: '',
    email: '',
    type: 'Senior Living',
    status: 'Active',
    contractStart: '',
    contractEnd: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [existingContractUrl, setExistingContractUrl] = useState<string | null>(null);
  const [editBaseline, setEditBaseline] = useState<EditBaseline | null>(null);

  const contractPreviewUrl = filePreviewUrl ?? existingContractUrl;
  const hasContractDocument = Boolean(fileName || existingContractUrl);
  const isContractImagePreview = selectedFile
    ? selectedFile.type.startsWith('image/')
    : /\.(png|jpe?g|webp|gif)(\?|$)/i.test(contractPreviewUrl ?? '');

  useEffect(() => {
    return () => {
      if (filePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit Facility' : 'Onboard New Facility'),
    [isEditMode],
  );
  const pageDescription = useMemo(
    () =>
      isEditMode
        ? 'Update facility details and save changes.'
        : 'Set up a new facility; the admin will receive an email to set their password.',
    [isEditMode],
  );

  const [createFacility, { isLoading: isCreating }] = useCreateFacilityMutation();
  const [updateFacility, { isLoading: isUpdating }] = useUpdateFacilityMutation();

  const { data: facility, isLoading: facilityLoading, isError: facilityLoadFailed, error: facilityLoadErr } = useGetFacilityByIdQuery(
    facilityId!,
    { skip: !isEditMode || !facilityId },
  );
  const adminId = facility?.facilityAdminId ?? '';
  const { data: adminUser } = useGetUserByIdQuery(adminId, {
    skip: !isEditMode || !adminId,
  });

  useEffect(() => {
    setEditBaseline(null);
    setSelectedFile(null);
    setFileName('');
    setExistingContractUrl(null);
    setFilePreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
  }, [facilityId]);

  useEffect(() => {
    if (!isEditMode || !facility) return;
    if (adminId && adminUser === undefined) return;

    const loadedFormData: CreateFacilityRequest = {
      name: facility.name ?? '',
      phone: facility.phone ?? '',
      email: facility.email ?? '',
      type: facility.type ?? 'Senior Living',
      status: facility.status ?? 'Active',
      contractStart: facility.contractStart ? facility.contractStart.split('T')[0] : '',
      contractEnd: facility.contractEnd ? facility.contractEnd.split('T')[0] : '',
      adminFirstName: adminUser?.firstName ?? (facility.facilityAdminName?.split(' ')[0] ?? ''),
      adminLastName: adminUser?.lastName ?? (facility.facilityAdminName?.split(' ').slice(1).join(' ') ?? ''),
      adminEmail: adminUser?.email ?? '',
    };

    setFormData(loadedFormData);
    setEditBaseline({
      formData: loadedFormData,
      contractDocumentUrl: facility.contractDocumentUrl ?? null,
    });

    if (facility.contractDocumentUrl) {
      setExistingContractUrl(facility.contractDocumentUrl);
      setFileName('Contract Document');
    } else {
      setExistingContractUrl(null);
      setFileName('');
    }
  }, [isEditMode, facility, adminUser, adminId]);

  const hasEditChanges = useMemo(() => {
    if (!isEditMode || !editBaseline) return false;

    if (EDIT_FORM_KEYS.some((key) => formData[key] !== editBaseline.formData[key])) {
      return true;
    }
    if (selectedFile) return true;
    return false;
  }, [isEditMode, editBaseline, formData, selectedFile]);

  useEffect(() => {
    if (!facility) return;
    sessionStorage.setItem(`breadcrumb:facilities:${facility.id}`, facility.name);
    window.dispatchEvent(new Event('oron:breadcrumb:update'));
  }, [facility]);

  const handleInputChange = (field: keyof CreateFacilityRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const steps = [
    {
      id: 1,
      title: 'Facility Details',
      icon: Building2
    },
    {
      id: 2,
      title: 'Contract Details',
      icon: FileText
    },
    {
      id: 3,
      title: 'Admin Account',
      icon: User
    },
    {
      id: 4,
      title: 'Review',
      icon: CheckCircle
    }];

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (isEditMode && facilityId) {
        if (!formData.adminEmail) {
          throw new Error('Facility admin email is required.');
        }

        const updatePayload: UpdateFacilityRequest = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          type: formData.type,
          status: formData.status,
          contractStart: formData.contractStart,
          contractEnd: formData.contractEnd,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
        };
        await updateFacility({ id: facilityId, body: updatePayload }).unwrap();
        toast.success('Facility updated successfully.');
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('contractStart', formData.contractStart);
        formDataToSend.append('contractEnd', formData.contractEnd);
        formDataToSend.append('adminFirstName', formData.adminFirstName);
        formDataToSend.append('adminLastName', formData.adminLastName);
        formDataToSend.append('adminEmail', formData.adminEmail);
        if (selectedFile) {
          formDataToSend.append('contractDocument', selectedFile);
        }
        const createdFacilityResponse = await createFacility(formDataToSend).unwrap();
        toast.success(getApiSuccessMessage(createdFacilityResponse, 'Facility created successfully.'));
      }

      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/owner/facilities');
      }, 1500);
    } catch (err) {
      const message = getApiErrorMessage(err, isEditMode ? 'Failed to update facility' : 'Failed to create facility');
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      console.error(err);
    }
  };

  const submissionBusy = isSubmitting || isCreating || isUpdating;

  if (isEditMode && facilityId && facilityLoading) {
    return <FacilityOnboardingStepSkeleton step={step} />;
  }
  if (isEditMode && facilityId && facilityLoadFailed) {
    return (
      <div className="max-w-3xl mx-auto p-4 rounded-lg bg-red-50 text-red-700 text-sm">
        {getApiErrorMessage(facilityLoadErr, 'Failed to load facility')}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {pageTitle}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {pageDescription}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 -z-10 transition-all duration-300"
          style={{
            width: `${(step - 1) / 3 * 100}%`
          }}>
        </div>

        {steps.map((s) =>
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>

              <s.icon className="h-5 w-5" />
            </div>
            <span
              className={`text-xs font-medium ${step >= s.id ? 'text-brand-700' : 'text-slate-500'}`}>

              {s.title}
            </span>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 min-h-[400px] relative">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 1 &&
              <motion.div
                key="step1"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Facility Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Facility Name"
                    placeholder="e.g. Sunrise Senior Living"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Facility Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}>
                        <option>Senior Living</option>
                        <option>Assisted Living</option>
                        <option>Memory Care</option>
                        <option>Multi-Specialty</option>
                      </select>
                    </div>
                    <Input
                      label="Phone Number"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)} />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="contact@facility.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)} />

                </div>
              </motion.div>
            }

            {step === 2 &&
              <motion.div
                key="step2"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Contract Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contract Start Date"
                    type="date"
                    value={formData.contractStart}
                    onChange={(e) => handleInputChange('contractStart', e.target.value)} />
                  <Input
                    label="Contract End Date"
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => handleInputChange('contractEnd', e.target.value)} />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contract Document
                  </label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <input
                      type='file'
                      id="fileInput"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setFileName(file.name);
                          setFilePreviewUrl((prev) => {
                            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
                            return URL.createObjectURL(file);
                          });
                        }
                      }}
                    />

                    {hasContractDocument ? (
                      <div className="flex items-center justify-center gap-3">
                        {contractPreviewUrl && (
                          <a
                            href={contractPreviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0"
                            title="Open preview in new tab"
                          >
                            {isContractImagePreview ? (
                              <img
                                src={contractPreviewUrl}
                                alt={fileName}
                                className="h-24 w-24 rounded-lg border border-slate-200 object-cover bg-white"
                              />
                            ) : (
                              <PdfThumbnail fileUrl={contractPreviewUrl} />
                            )}
                          </a>
                        )}

                        <div className="text-sm font-medium text-slate-900 text-left">
                          <span className="text-green-600">
                            {selectedFile ? '✓ File selected: ' : '✓ Current document: '}
                          </span>
                          {fileName}
                          {isEditMode && existingContractUrl && !selectedFile && (
                            <p className="text-xs text-slate-500 mt-1 font-normal">
                              Upload a new PDF to replace this document.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            }

            {step === 3 &&
              <motion.div
                key="step3"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Facility Admin Account
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  This user will receive an email with a secure link to set their
                  password and complete facility setup, including adding branches.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      value={formData.adminFirstName}
                      onChange={(e) => handleInputChange('adminFirstName', e.target.value)} />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.adminLastName}
                      onChange={(e) => handleInputChange('adminLastName', e.target.value)} />
                  </div>
                  <Input
                    label="Admin Email"
                    type="email"
                    placeholder="jane@facility.com"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)} />


                </div>
              </motion.div>
            }

            {step === 4 &&
              <motion.div
                key="step4"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-6">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Review & Confirm
                </h2>

                <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Facility Name</p>
                      <p className="text-sm font-medium text-slate-900">{formData.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm font-medium text-slate-900">{formData.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contract Period</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formData.contractStart || '-'} - {formData.contractEnd || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Facility Admin Account
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {`${formData.adminFirstName || '-'} ${formData.adminLastName || ''}`.trim()} ({formData.adminEmail || '-'})
                    </p>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || submissionBusy}
            icon={ArrowLeft}>

            Back
          </Button>

          {step < 4 ?
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button> :

            <Button
              onClick={handleSubmit}
              isLoading={submissionBusy}
              disabled={isEditMode && !hasEditChanges}
              icon={CheckCircle}>

              {isEditMode ? 'Save Changes' : 'Confirm & Onboard'}
            </Button>
          }
        </div>
      </Card>
    </div>);

};