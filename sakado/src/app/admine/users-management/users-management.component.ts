import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { DocumentSnapshot } from 'firebase/firestore';

@Component({
  selector: 'app-users-management',
  standalone: false,
  templateUrl:'./users-management.component.html',
  styleUrls: ['./users-management.component.scss'], // fixed typo
})
export class UsersManagementComponent implements OnInit {
  showDeleteConfirmation = false;
  userToDelete: User | null = null;

  users: User[] = [];
  loading = false;

  // Pagination state
  currentPage = 1;
  pageSize = 5;
  cursors: (DocumentSnapshot | null)[] = [null];
  totalUsers = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    this.setLoading(true);
    try {
      this.totalUsers = await this.authService.getTotalUsers(); // Note: renamed from getTotalTrips to getTotalUsers
      this.calculateTotalPages();
      await this.loadUsers();
    } catch (error) {
      this.handleError('Initialization error', error);
    } finally {
      this.setLoading(false);
    }
  }

  async loadUsers(): Promise<void> {
    this.setLoading(true);
    try {
      const lastDoc = this.cursors[this.currentPage - 1] || null;
      const { users, lastDoc: nextLastDoc } = await this.authService.getUsers(
        this.pageSize,
        lastDoc
      );

      this.users = users;

      if (users.length > 0) {
        this.cursors[this.currentPage] = nextLastDoc;
      }
    } catch (error) {
      this.handleError('Error loading users', error);
    } finally {
      this.setLoading(false);
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirmation = true;
  }

  async deleteUser(): Promise<void> {
    if (!this.userToDelete?.uid) {
      console.warn('No user selected for deletion');
      return;
    }

    this.setLoading(true);
    try {
      await this.authService.deleteUser(this.userToDelete.uid);

      // Remove deleted user from list & update pagination
      this.users = this.users.filter((u) => u.uid !== this.userToDelete?.uid);
      this.totalUsers = Math.max(0, this.totalUsers - 1);
      this.calculateTotalPages();

      this.showDeleteConfirmation = false;
      this.userToDelete = null;

      alert('تم حذف المستخدم بنجاح!');
    } catch (error) {
      this.handleError('Deletion failed', error);
    } finally {
      this.setLoading(false);
    }
  }

  // Pagination controls
  async nextPage(): Promise<void> {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.loadUsers();
    }
  }

  async prevPage(): Promise<void> {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadUsers();
    }
  }

  async changePageSize(size: number): Promise<void> {
    this.pageSize = size;
    this.currentPage = 1;
    this.cursors = [null];
    await this.loadUsers();
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize) || 1;
  }

  private setLoading(value: boolean): void {
    this.loading = value;
  }

  private handleError(context: string, error: unknown): void {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`${context}: ${errorMessage}`, error);
  }
}
