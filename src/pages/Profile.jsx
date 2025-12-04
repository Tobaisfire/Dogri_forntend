function Profile() {
  return (
    <div className="analytics-panel">
      <header className="manual-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">User account information</p>
        </div>
      </header>

      <section className="manual-card">
        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              U
            </div>
          </div>
          
          <div className="profile-info">
            <h2>User</h2>
            <p className="profile-username">Guest User</p>
          </div>

          <div className="profile-details">
            <div className="profile-detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value">Active</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Session Type</span>
              <span className="detail-value">Browser Session</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile

