import { supabase } from "../supabase";

/**
 * Get students with tracks, paginated
 * @param {number} page - page number (1-based)
 * @param {number} pageSize - number of students per page
 */
export async function getStudents(page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: students, error } = await supabase
    .from("student_with_tracksarray")
    .select("student_id,student_name,total_score,tracks")
    .order("total_score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }

  return students;
}

/**
 * Search students by name, paginated
 */
export async function SearchStudentByName(name, page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: students, error } = await supabase
    .from("student_with_tracksarray")
    .select("student_id,student_name,total_score,tracks")
    .ilike("student_name", `%${name}%`) // case-insensitive search
    .order("total_score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }

  return students;
}

/**
 * Search students by phone, paginated
 */
export async function SearchStudentByPhone(phone, page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: students, error } = await supabase
    .from("student_with_tracksarray")
    .select("student_id,student_name,total_score,tracks")
    .like("phone", `%${phone}%`) // case-sensitive
    .order("total_score", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }

  return students;
}

export const StudentsTable = {
  getStudents,
  SearchStudentByName,
  SearchStudentByPhone
};
