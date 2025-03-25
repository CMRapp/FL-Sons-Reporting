'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';

interface FormData {
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
}

const UploadForm = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    userEmail: '',
    userTitle: '',
    squadronNumber: '',
    districtNumber: '',
  });

  const [files, setFiles] = useState<(File | null)[]>(Array(10).fill(null));
  const [uploadStatus, setUploadStatus] = useState<string[]>(Array(10).fill(''));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentReportName, setCurrentReportName] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear all error messages when user starts typing
    setUploadStatus(Array(10).fill(''));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

      // Check file size
      if (file.size > maxSize) {
        setUploadStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = `Error: File size exceeds 10MB limit`;
          return newStatus;
        });
        e.target.value = ''; // Clear the input
        const newFiles = [...files];
        newFiles[index] = null;
        setFiles(newFiles);
        return;
      }

      // Validate file type and extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileType) || !allowedExtensions.includes(fileExtension || '')) {
        setUploadStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = 'Error: Please upload only .jpg, .png, or .pdf files';
          return newStatus;
        });
        e.target.value = ''; // Clear the input
        const newFiles = [...files];
        newFiles[index] = null;
        setFiles(newFiles);
        return;
      }

      // Sanitize filename
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const newFile = new File([file], sanitizedFileName, { type: file.type });
      
      const newFiles = [...files];
      newFiles[index] = newFile;
      setFiles(newFiles);
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = ''; // Clear any previous error
        return newStatus;
      });
    }
  };

  const handleSubmit = async (index: number) => {
    if (!files[index]) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Error: Please select a file first';
        return newStatus;
      });
      return;
    }

    // Validate form data
    if (!formData.userName || !formData.userEmail || !formData.userTitle || 
        !formData.squadronNumber || !formData.districtNumber) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Error: Please fill in all required fields';
        return newStatus;
      });
      return;
    }

    // Enhanced email validation
    if (!validateEmail(formData.userEmail)) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Error: Please enter a valid email address';
        return newStatus;
      });
      return;
    }

    // Sanitize form inputs
    const sanitizedFormData = {
      userName: formData.userName.replace(/[<>]/g, ''),
      userEmail: formData.userEmail.toLowerCase().trim(),
      userTitle: formData.userTitle.replace(/[<>]/g, ''),
      squadronNumber: formData.squadronNumber.replace(/[^0-9]/g, ''),
      districtNumber: formData.districtNumber.replace(/[^0-9]/g, '')
    };

    // Validate squadron number format
    if (!/^\d+$/.test(sanitizedFormData.squadronNumber)) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Error: Squadron number must contain only digits';
        return newStatus;
      });
      return;
    }

    // Validate district number
    if (!districtNumbers.includes(parseInt(sanitizedFormData.districtNumber))) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Error: Invalid district number';
        return newStatus;
      });
      return;
    }

    const formDataToSend = new FormData();
    
    // Get the report name based on the index
    const reportName = index === 0 ? 'NCSR' :
                      index === 1 ? 'DCSR' :
                      index === 2 ? 'VA&R' :
                      index === 3 ? 'VAVS-VOY' :
                      index === 4 ? 'AMERICANISM' :
                      index === 5 ? 'C&Y' :
                      index === 6 ? 'SIR' :
                      index === 7 ? 'SDR' :
                      index === 8 ? 'SOC' :
                      'DOR';

    setCurrentReportName(reportName);

    // Create new file with formatted name
    const originalFile = files[index];
    const fileExtension = originalFile?.name.split('.').pop()?.toLowerCase() || '';
    const newFileName = `FL-SQ${sanitizedFormData.squadronNumber}-${reportName}.${fileExtension}`;
    const newFile = new File([originalFile!], newFileName, { type: originalFile!.type });
    
    formDataToSend.append('file', newFile);
    Object.entries(sanitizedFormData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      // Only set uploading status for the current index
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'Uploading...';
        return newStatus;
      });

      const response = await fetch(`/api/upload/${index + 1}`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      // Show modal instead of alert
      setModalMessage(`Thank you, ${formData.userName}, your ${reportName} has been submitted.`);
      setIsModalOpen(true);
      
      // Only clear the file input for this specific report
      const newFiles = [...files];
      newFiles[index] = null;
      setFiles(newFiles);
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = `Success: ${reportName} has been submitted successfully`;
        return newStatus;
      });
    } catch (error) {
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = `Error: ${error instanceof Error ? error.message : 'Failed to upload file'}`;
        return newStatus;
      });
    }
  };

  const districtNumbers = Array.from({ length: 17 }, (_, i) => i + 1).filter(num => num !== 10);

  return (
    <div className="w-full min-h-screen bg-[url('/flag-body-bg.png')] bg-no-repeat bg-cover -mt-6">
      <div className="max-w-4xl lg:max-w-[1200px] mx-auto p-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/fl-sons-150.png"
            alt="Florida Sons of the American Revolution Logo"
            width={168}
            height={150}
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800 uppercase">Report Submission Portal</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-black uppercase">Name</label>
              <input
                id="userName"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
                required
                aria-required="true"
                aria-label="Your name"
              />
            </div>
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-black uppercase">Email</label>
              <input
                id="userEmail"
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
                required
                aria-required="true"
                aria-label="Your email"
              />
            </div>
            <div>
              <label htmlFor="userTitle" className="block text-sm font-medium text-black uppercase">Title</label>
              <input
                id="userTitle"
                type="text"
                name="userTitle"
                value={formData.userTitle}
                onChange={handleInputChange}
                placeholder="Enter your title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
                required
                aria-required="true"
                aria-label="Your title"
              />
            </div>
            <div>
              <label htmlFor="squadronNumber" className="block text-sm font-medium text-black uppercase">Squadron Number</label>
              <input
                id="squadronNumber"
                type="text"
                name="squadronNumber"
                value={formData.squadronNumber}
                onChange={handleInputChange}
                placeholder="Enter squadron number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
                required
                aria-required="true"
                aria-label="Squadron number"
              />
            </div>
            <div>
              <label htmlFor="districtNumber" className="block text-sm font-medium text-black uppercase">District Number</label>
              <select
                id="districtNumber"
                name="districtNumber"
                value={formData.districtNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black placeholder:text-gray-400"
                required
                aria-required="true"
                aria-label="District number"
              >
                <option value="">Select a district</option>
                {districtNumbers.map(num => (
                  <option key={num} value={num}>District {num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-6">
                <h4 className="text-l font-semibold mb-4 text-black uppercase">
                  {index === 0 ? 'National Consolidated Squadron Report (NCSR)' : 
                   index === 1 ? 'Detachment Consolidated Squadron Report (DCSR)' : 
                   index === 2 ? 'Veterans Affairs & Rehabilitation (VA&R)' :
                   index === 3 ? 'VAVS Volunteer of the Year' :
                   index === 4 ? 'Americanism' :
                   index === 5 ? 'Children & Youth (C&Y)' :
                   index === 6 ? 'Squadron Information Report (SIR)' :
                   index === 7 ? 'Annual Squadron Data Report (SDR)' :
                   index === 8 ? 'Squadron Officer Change (SOC)' :
                   index === 9 ? 'District Officers Report (DOR)' :
                   `Upload #${index + 1}`}
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Image
                        src="/file.svg"
                        alt="Upload icon"
                        width={20}
                        height={20}
                        className="text-gray-500"
                        aria-hidden="true"
                      />
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(index, e)}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="flex-1 text-black placeholder:text-gray-200 file:text-blue-500"
                        aria-label={`Upload file for ${index === 0 ? 'National Consolidated Squadron Report' : 
                                   index === 1 ? 'Detachment Consolidated Squadron Report' : 
                                   index === 2 ? 'Veterans Affairs & Rehabilitation' :
                                   index === 3 ? 'VAVS Volunteer of the Year' :
                                   index === 4 ? 'Americanism' :
                                   index === 5 ? 'Children & Youth' :
                                   index === 6 ? 'Squadron Information Report' :
                                   index === 7 ? 'Annual Squadron Data Report' :
                                   index === 8 ? 'Squadron Officer Change' :
                                   'District Officers Report'}`}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Accepted file types: JPG, PNG, PDF (Max size: 10MB)</p>
                  </div>
                  <button
                    onClick={() => handleSubmit(index)}
                    disabled={uploadStatus[index] === 'Uploading...'}
                    className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      uploadStatus[index] === 'Uploading...' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={`Submit ${index === 0 ? 'National Consolidated Squadron Report' : 
                               index === 1 ? 'Detachment Consolidated Squadron Report' : 
                               index === 2 ? 'Veterans Affairs & Rehabilitation' :
                               index === 3 ? 'VAVS Volunteer of the Year' :
                               index === 4 ? 'Americanism' :
                               index === 5 ? 'Children & Youth' :
                               index === 6 ? 'Squadron Information Report' :
                               index === 7 ? 'Annual Squadron Data Report' :
                               index === 8 ? 'Squadron Officer Change' :
                               'District Officers Report'}`}
                    aria-disabled={uploadStatus[index] === 'Uploading...'}
                  >
                    {uploadStatus[index] === 'Uploading...' ? 'Uploading...' : 'Submit'}
                  </button>
                </div>
                {uploadStatus[index] && (
                  <p 
                    className={`mt-2 ${uploadStatus[index].includes('Error') ? 'text-red-500' : 'text-green-500'}`}
                    role="alert"
                  >
                    {uploadStatus[index]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`${currentReportName} Submission`}
      >
        <p className="text-gray-700">{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default UploadForm; 