import ProfileClient from "@/components/ProfileClient";

// Force dynamic rendering to prevent server-side execution
export const dynamic = 'force-dynamic';

const ProfilePage = () => {
  return <ProfileClient />;
};

export default ProfilePage;
