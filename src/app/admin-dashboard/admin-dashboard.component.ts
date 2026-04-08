import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../auth/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { UserEditDialogComponent } from './user-edit-dialog/user-edit-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['name', 'email', 'phoneNumber', 'vat', 'createdAt', 'startContractAt', 'endContractAt', 'isActive', 'isAdmin', 'actions', 'delete'];
  dataSource = new MatTableDataSource<UserModel>([]);

  totalUsers  = 0;
  activeUsers = 0;

  private originalActiveState = new Map<string, boolean>();


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort)      sort: MatSort;

  constructor(private userService: UserService, private dialog: MatDialog, private fns: AngularFireFunctions) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data: UserModel[]) => {
      this.dataSource.data = data;
      this.totalUsers  = data.length;
      this.activeUsers = data.filter(u => u.isActive).length;
      data.forEach(u => this.originalActiveState.set(u.urid, u.isActive));
      // re-attach in case ngAfterViewInit already ran
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort)      this.dataSource.sort      = this.sort;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  saveUser(user: UserModel, event: Event): void {
    event.stopPropagation();
    this.userService.setSelectedAdminUser(user);
    const today = new Date().toISOString().split('T')[0];
    const wasActive = this.originalActiveState.get(user.urid);

    if (user.isActive && !wasActive) {
      user.startContractAt = today;
    } else if (!user.isActive && wasActive) {
      user.endContractAt = today;
    }

    this.userService.updateUser(user).then(() => {
      this.originalActiveState.set(user.urid, user.isActive);
      this.activeUsers = [...this.originalActiveState.values()].filter(v => v).length;
    });
  }

  deleteUser(user: UserModel, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Διαγραφή χρήστη',
      html: `Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη<br><strong>${user.name}</strong>;<br><small>Η ενέργεια δεν αναιρείται.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#666',
      cancelButtonText: 'Ακύρωση',
      confirmButtonText: 'Διαγραφή',
    }).then(result => {
      if (!result.isConfirmed) return;

      const deleteFn = this.fns.httpsCallable('deleteUser');
      deleteFn({ urid: user.urid }).subscribe({
        next: () => {
          Swal.fire('Διαγράφηκε!', `Ο χρήστης "${user.name}" διαγράφηκε επιτυχώς.`, 'success');
          this.dataSource.data = this.dataSource.data.filter(u => u.urid !== user.urid);
          this.totalUsers  = this.dataSource.data.length;
          this.activeUsers = this.dataSource.data.filter(u => u.isActive).length;
          this.originalActiveState.delete(user.urid);
        },
        error: (err) => {
          Swal.fire('Σφάλμα', err?.message || 'Η διαγραφή απέτυχε.', 'error');
        }
      });
    });
  }


  openEditDialog(user: UserModel): void {
    this.userService.setSelectedAdminUser(user);

    const ref = this.dialog.open(UserEditDialogComponent, {
      width: '500px',
      disableClose: false,
      data: { ...user }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const updated: UserModel = { ...user, ...result };
      this.userService.updateUser(updated).then(() => {
        // Reflect changes in the table immediately
        Object.assign(user, result);
        this.activeUsers = this.dataSource.data.filter(u => u.isActive).length;
      });
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
