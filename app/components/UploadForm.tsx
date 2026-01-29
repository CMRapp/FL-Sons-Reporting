'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import JumpBar from './JumpBar';
import { getServiceYear } from '@/app/utils/serviceYear';

interface FormData {
  userName: string;
  userEmail: string;
  userTitle: string;
  squadronNumber: string;
  districtNumber: string;
}

const UploadForm = () => {
  const districtNumbers = Array.from({ length: 17 }, (_, i) => i + 1).filter(num => num !== 10);
  const serviceYear = getServiceYear();

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
  const [focusedReport, setFocusedReport] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

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
      
      // Allow PDF and image formats only for security
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/svg+xml'
      ];

      if (!allowedTypes.includes(fileType)) {
        setUploadStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = 'Error: Only PDF and image files are allowed for security purposes';
          return newStatus;
        });
        return;
      }

      if (file.size > maxSize) {
        setUploadStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = 'Error: File size must be less than 10MB';
          return newStatus;
        });
        return;
      }

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'File selected';
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

    // Append the original file without renaming
    formDataToSend.append('file', files[index]!);
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

      console.log('Submitting form data:', {
        reportName,
        fileName: files[index]?.name,
        fileSize: files[index]?.size,
        fileType: files[index]?.type,
        ...sanitizedFormData
      });

      const response = await fetch(`/api/upload/${index + 1}`, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      console.log('Parsed response:', result);
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Upload failed');
      }

      // Show modal instead of alert
      setModalMessage(`Thank you, ${formData.userName}, your ${reportName} has been submitted. You will receive a confirmation email shortly. Save this email for your records`);
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
      console.error('Upload error:', error);
      setUploadStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = `Error: ${error instanceof Error ? error.message : 'Upload failed'}`;
        return newStatus;
      });
    }
  };

  const handleJumpToReport = (reportId: string) => {
    if (reportId) {
      setFocusedReport(reportId);
      const element = document.getElementById(reportId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Remove focus after 3 seconds
        setTimeout(() => {
          setFocusedReport(null);
        }, 3000);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[url('/flag-body-bg.png')] bg-no-repeat bg-cover -mt-6">
      {/* File Format Disclaimer Modal */}
      <Modal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        title="⚠️ Important: File Format Requirements"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 font-semibold mb-2">
              For security purposes, only the following file formats are accepted:
            </p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1 ml-4">
              <li>PDF files (.pdf)</li>
              <li>Image files (.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg)</li>
            </ul>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-800 font-semibold mb-2">
              ❌ NOT Accepted:
            </p>
            <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
              <li>Microsoft Office files (.docx, .xlsx, .doc, .xls)</li>
              <li>Executable files (.exe, .bat, .sh)</li>
              <li>Archive files (.zip, .rar)</li>
            </ul>
          </div>
          <p className="text-gray-700 text-sm">
            <strong>Note:</strong> If your report is in a Word or Excel format, please convert it to PDF before uploading.
            Most office software has a &quot;Save as PDF&quot; or &quot;Export to PDF&quot; option.
          </p>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
          >
            I Understand - Continue to Upload
          </button>
        </div>
      </Modal>
      
      <div className="max-w-4xl lg:max-w-[1200px] mx-auto p-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/fl-sons-150.png"
            alt="Florida Sons of the American Legion Logo"
            width={168}
            height={150}
            priority
          />
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800 uppercase">* {serviceYear} Report Submission Portal *</h1>
        <p className="text-center text-black text-xl">Please fill out the form below to submit your reports for the {serviceYear} service year.</p>
        <p className="text-center text-black text-xl italic font-bold  mb-8">Send any issues or questions to <a href="mailto:adjutant@floridasons.org" className="text-blue-500">adjutant@floridasons.org</a></p>
        {/* User Information Form */}
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

        {/* JumpBar */}
        <JumpBar onSelect={handleJumpToReport} />

        {/* Report Submission Sections */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 10 }, (_, index) => (
              <div 
                key={index} 
                id={`report-${index === 0 ? 'ncsr' : 
                         index === 1 ? 'dcsr' : 
                         index === 2 ? 'var' :
                         index === 3 ? 'vavs-voy' :
                         index === 4 ? 'americanism' :
                         index === 5 ? 'cy' :
                         index === 6 ? 'sir' :
                         index === 7 ? 'sdr' :
                         index === 8 ? 'soc' :
                         'dor'}`} 
                className={`bg-white shadow-md rounded-lg p-6 transition-all duration-300 ${
                  focusedReport === `report-${index === 0 ? 'ncsr' : 
                                   index === 1 ? 'dcsr' : 
                                   index === 2 ? 'var' :
                                   index === 3 ? 'vavs-voy' :
                                   index === 4 ? 'americanism' :
                                   index === 5 ? 'cy' :
                                   index === 6 ? 'sir' :
                                   index === 7 ? 'sdr' :
                                   index === 8 ? 'soc' :
                                   'dor'}` 
                  ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-lg' 
                  : ''
                }`}
              >
                <h4 className="text-l font-semibold text-black uppercase">
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
                <p className="text-blue-500">
                  {index === 0 ? 'Submit a COPY of your NATIONAL CSR.' :
                   index === 1 ? 'Annual DETACHMENT report highlighting your squadron\'s activities and achievements.' :
                   index === 2 ? 'Annual report on your squadron\'s VA&R activities.' :
                   index === 3 ? 'Nomination form for VAVS Volunteer of the Year award' :
                   index === 4 ? 'Annual Report on your squadron\'s Americanism programs and activities' :
                   index === 5 ? 'Annual Report on your squadron\'s C&Y programs and activities' :
                   index === 6 ? 'Squadron Officer Information Report' :
                   index === 7 ? 'Indicates the amount of dues money to collect by National' :
                   index === 8 ? 'Documentation of squadron officer changes and updates' :
                   'Report on district-level officer appointments and changes'}
                </p>
                <p className="text-red-500 font-bold italic uppercase text-xs my-2">
                  {index === 0 ? 'Use the myLegion.org portal to submit your NATIONAL CSR or mail a copy to National Headquarters.' :
                   index === 1 ? 'Due by May 15th of every year' :
                   index === 2 ? 'Due by May 15th of every year' :
                   index === 3 ? 'Due by May 15th of every year' :
                   index === 4 ? 'Due by May 15th of every year' :
                   index === 5 ? 'Due by May 15th of every year' :
                   index === 6 ? 'Must be submitted immediately following squadron elections' :
                   index === 7 ? 'Only submit if there has been a change in your dues or squadron information. Submit by April 9th of every year':
                   index === 8 ? 'Due within 30 days of a squadron officer officer change' :
                   'Due immediately following your District Constitutional Conference (DCC)'}
                </p>
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
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
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
                    <p className="text-sm text-gray-500 mt-1">Accepted file types: PDF and image files only (Max size: 10MB)</p>
                    <button
                      onClick={() => handleSubmit(index)}
                      disabled={uploadStatus[index] === 'Uploading...'}
                      className={`mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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