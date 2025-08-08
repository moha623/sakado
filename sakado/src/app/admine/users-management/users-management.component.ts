import { Component } from '@angular/core';
import { TripService } from '../../services/trip.service';
import { Trip } from '../../models/trip.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { DocumentSnapshot } from 'firebase/firestore';
@Component({
  selector: 'app-users-managment',
  standalone: false,
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss'], // fix here
})
export class UsersManagementComponent {
  showDeleteConfirmation = false;
  userToDelete: User | null = null;
  users: User[] = [];
  loading = true;
  // Pagination
  currentPage = 1;
  pageSize = 5;
  cursors: (DocumentSnapshot | null)[] = [null];
  totalPages = 0;
  totalUsers = 0;
  pageSizes = [5, 10, 20];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadInitialData();
    console.log(this.users)
  }

  async loadInitialData() {
    this.loading = true;
    try {
      this.totalUsers = await this.authService.getTotalTrips();
      this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
      await this.loadUsers();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  async loadUsers() {
    try {
      const lastDoc = this.cursors[this.currentPage - 1];
      const result = await this.authService.getUsers(this.pageSize,lastDoc);
      this.users = result.users;
      if (result.users.length) {
        this.cursors[this.currentPage] = result.lastDoc;
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      this.loading = false;
    }
  }
confirmDelete(user: User) {
  this.userToDelete = user;
  this.showDeleteConfirmation = true;
}

async deleteUser() {
  if (!this.userToDelete?.uid) return;

  try {
    await this.authService.deleteUser(this.userToDelete.uid);
    
    // Update UI
    this.users = this.users.filter(u => u.uid !== this.userToDelete?.uid);
    this.totalUsers--;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    
    this.showDeleteConfirmation = false;
    this.userToDelete = null;
    
    alert('تم حذف المستخدم بنجاح!');
  } catch (error) {
    console.error('Deletion failed:', error);
 
  }
}

  

    // Pagination controls
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  async changePageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.cursors = [null];
    await this.loadUsers();
  }

}
