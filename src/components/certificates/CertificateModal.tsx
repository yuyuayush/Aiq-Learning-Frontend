    "use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: {
    id: string;
    course: {
      title: string;
    };
    user: {
      name: string;
    };
    issuedAt: string;
    certificateId: string;
  };
}

export default function CertificateModal({ isOpen, onClose, certificate }: CertificateModalProps) {
  const { toast } = useToast();



  const downloadCertificate = () => {
    // For now, just show a message that download is not implemented
    toast({
      title: "Download",
      description: "Certificate download feature coming soon!",
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate of Completion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Certificate Preview */}
          <div className="relative bg-gray-50 rounded-lg p-4">
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              {/* Certificate Template Image */}
              <img
                src="/certificate-template.png"
                alt="Certificate Template"
                className="w-full h-full object-contain border-2 border-gray-200 rounded"
              />
              
              {/* Text Overlays with absolute positioning */}
              <div className="absolute inset-0">
                {/* Logo at top left */}
                <div 
                  className="absolute"
                  style={{ 
                    left: '4%', 
                    top: '8%', 
                    zIndex: 10
                  }}
                >
                  <img 
                    src="/logo/logo.png" 
                    alt="Logo" 
                    className="w-22 h-16 object-contain"
                  />
                </div>

                {/* Student Name */}
                <div 
                  className="absolute text-center bebas-neue-regular"
                  style={{ 
                    left: '50%', 
                    top: '63%', 
                    transform: 'translateX(-50%) translateY(-116%)',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#2C3E50',
                    zIndex: 10
                  }}
                >
                  {certificate.user.name}
                </div>
                
                {/* Course Name */}
                <div 
                  className="absolute text-center"
                  style={{ 
                    left: '50%', 
                    top: '75%', 
                    transform: 'translateX(-50%) translateY(-280%)',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '1.25rem',
                    color: '#34495E',
                    zIndex: 10
                  }}
                >
                  For the Course "{certificate.course.title}"
                </div>
                
                {/* Left Signature */}
                <div 
                  className="absolute text-center cedarville-cursive-regular"
                  style={{ 
                    left: '18%', 
                    top: '85%', 
                    transform: 'translateX(-20%) translateY(-220%)',
                    fontSize: '1.5rem',
                    color: '#2C3E50',
                    zIndex: 10
                  }}
                >
                  Dr. John Smith
                </div>
                
                {/* Left Name */}
                <div 
                  className="absolute text-center text-sm"
                  style={{ 
                    left: '18%', 
                    top: '90%', 
                    transform: 'translateX(-5%) translateY(-320%)',
                    color: '#2C3E50',
                    zIndex: 10
                  }}
                >
                  Course Instructor
                </div>
                
                {/* Right Signature */}
                <div 
                  className="absolute text-center cedarville-cursive-regular"
                  style={{ 
                    left: '82%', 
                    top: '85%', 
                    transform: 'translateX(-90%) translateY(-220%)',
                    fontSize: '1.5rem',
                    color: '#2C3E50',
                    zIndex: 10
                  }}
                >
                  Jane Doe
                </div>
                
                {/* Right Name */}
                <div 
                  className="absolute text-center text-sm"
                  style={{ 
                    left: '82%', 
                    top: '90%', 
                    transform: 'translateX(-90%) translateY(-320%)',
                    color: '#2C3E50',
                    zIndex: 10
                  }}
                >
                  Academic Director
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Certificate ID:</strong> {certificate.certificateId}</p>
              <p><strong>Issued To:</strong> {certificate.user.name}</p>
            </div>
            <div>
              <p><strong>Course:</strong> {certificate.course.title}</p>
              <p><strong>Issued On:</strong> {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={downloadCertificate} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}