package com.peopleos.payroll.entity;

import com.peopleos.employee.entity.Employee;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/** Monthly salary breakdown for one employee (amounts in INR). */
@Entity
@Table(name = "payroll", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payroll_employee", columnNames = "employee_id")
})
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(nullable = false)
    private long basic;

    @Column(nullable = false)
    private long hra;

    @Column(nullable = false)
    private long allowances;

    @Column(nullable = false)
    private long deductions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public long net() {
        return basic + hra + allowances - deductions;
    }

    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public long getBasic() { return basic; }
    public void setBasic(long basic) { this.basic = basic; }
    public long getHra() { return hra; }
    public void setHra(long hra) { this.hra = hra; }
    public long getAllowances() { return allowances; }
    public void setAllowances(long allowances) { this.allowances = allowances; }
    public long getDeductions() { return deductions; }
    public void setDeductions(long deductions) { this.deductions = deductions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
