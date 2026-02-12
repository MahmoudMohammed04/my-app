import Image from "next/image";
import { db } from "@/supabase/connection";
import StudentDashboard from "@/supabase/app";

export default async function Home() {

 
  return (  

   <StudentDashboard />
          
  );
}
