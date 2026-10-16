// Inheritance: Student "is a" Person
public class Student extends Person {
    private int id;
    private String department;
    private double cgpa;

    public Student(int id, String name, String email, String department, double cgpa) {
        super(name, email);
        this.id = id;
        this.department = department;
        this.cgpa = cgpa;
    }

    public int getId() { return id; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    @Override
    public String getRole() { return "Student"; }

    // Save format for file
    public String toCsv() {
        return id + "," + getName() + "," + getEmail() + "," + department + "," + cgpa;
    }

    public static Student fromCsv(String line) {
        String[] p = line.split(",");
        return new Student(Integer.parseInt(p[0]), p[1], p[2], p[3], Double.parseDouble(p[4]));
    }

    @Override
    public String toString() {
        return String.format("%-6d %-20s %-25s %-8s %.2f", id, getName(), getEmail(), department, cgpa);
    }
}
