import React, { useCallback, useEffect, useState } from 'react';
import { Card, Col, Container, Row, Form, Button, Spinner } from 'react-bootstrap';
import { UseSelect } from 'components/common/UseTable';
import accountService from 'services/accountService';
import companyService from 'services/companyService';
import { getAuthUser } from 'components/authentication/authStorage';
import { toast } from 'react-toastify';

const countryOptions = [
  { id: 'us', name: 'United States' },
  { id: 'uk', name: 'United Kingdom' },
  { id: 'eg', name: 'Egypt' }
];

const languageOptions = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'Arabic' },
  { id: 'fr', name: 'French' }
];

const timeZoneOptions = [
  { id: 'UTC', name: 'UTC' },
  { id: 'Europe/London', name: 'Europe/London' },
  { id: 'Africa/Cairo', name: 'Africa/Cairo' }
];

const currencyOptions = [
  { id: 'USD', name: 'USD' },
  { id: 'EUR', name: 'EUR' },
  { id: 'GBP', name: 'GBP' }
];

const AccountSettings = () => {
  const authUser = getAuthUser();
  const isPlatformAdmin = authUser?.roles?.includes('PLATFORM_ADMIN');
  // Never fall back to `sub` — that's the user-id GUID. Email is fine if the
  // backend hasn't surfaced a display name yet, but the real name comes from
  // accountService.getSettings (UserAccount.name).
  const authUserDisplayName = authUser?.name || authUser?.fullName || authUser?.email || '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [currency, setCurrency] = useState('');
  const [commEmail, setCommEmail] = useState(true);
  const [commSms, setCommSms] = useState(false);
  const [commPush, setCommPush] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const companyIdParam = isPlatformAdmin ? selectedCompanyId || undefined : undefined;

  const applyDto = useCallback((dto) => {
    // Prefer the real user name from the backend DTO (UserAccount.name).
    // Fall back to the auth-user display name (email at worst) — never to the
    // user-id GUID stored in JWT `sub`.
    setName(dto?.name || authUserDisplayName || '');
    setPhone(dto?.phone || '');
    setContactEmail(dto?.contactEmail || '');
    setCompanyPhone(dto?.companyPhone || '');
    setCountry(dto?.country || '');
    setLanguage(dto?.language || '');
    setTimeZone(dto?.timeZone || '');
    setCurrency(dto?.currency || '');
    setCommEmail(dto?.commEmail !== false);
    setCommSms(!!dto?.commSms);
    setCommPush(!!dto?.commPush);
    setHasCompany(!!dto?.hasCompany);
  }, [authUserDisplayName]);

  useEffect(() => {
    const loadCompanies = async () => {
      if (!isPlatformAdmin) return;
      try {
        const result = await companyService.list({ page: 0, size: 500 });
        const list = Array.isArray(result?.content) ? result.content : [];
        setCompanies(list);
        if (list.length) {
          setSelectedCompanyId((prev) => prev || String(list[0].id));
        }
      } catch {
        setCompanies([]);
      }
    };
    loadCompanies();
  }, [isPlatformAdmin]);

  useEffect(() => {
    if (isPlatformAdmin && !selectedCompanyId) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const id = isPlatformAdmin ? selectedCompanyId : undefined;
        const dto = await accountService.getSettings(id);
        if (!cancelled) applyDto(dto);
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Failed to load settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [applyDto, isPlatformAdmin, selectedCompanyId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isPlatformAdmin && !selectedCompanyId) {
      toast.error('Select a company');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name || null,
        phone: phone || null,
        contactEmail: contactEmail || null,
        companyPhone: companyPhone || null,
        country: country || null,
        currency: currency || null,
        language: language || null,
        timeZone: timeZone || null,
        commEmail,
        commSms,
        commPush
      };
      const id = isPlatformAdmin ? selectedCompanyId : undefined;
      const dto = await accountService.updateSettings(payload, id);
      applyDto(dto);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await accountService.changePassword({
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message || 'Password update failed');
    } finally {
      setPasswordSaving(false);
    }
  };

  const canEditCompanyFields = isPlatformAdmin ? !!selectedCompanyId : hasCompany;

  return (
    <Container fluid className="py-3">
      <Row className="mb-3">
        <Col>
          <h2 className="mb-0">My Profile</h2>
          <p className="text-700 mb-0">Profile details for client and company.</p>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          {isPlatformAdmin && (
            <Card className="mb-3">
              <Card.Body>
                <Form.Group>
                  <Form.Label>Company (platform)</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="">Select company…</option>
                    {companies.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name || c.code || c.id}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Profile Details</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Form onSubmit={handleSaveProfile}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>User Name</Form.Label>
                        <Form.Control
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="User name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Phone</Form.Label>
                        <Form.Control
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          type="tel"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Email (company)</Form.Label>
                        <Form.Control
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="contact@company.com"
                          disabled={!canEditCompanyFields}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Phone</Form.Label>
                        <Form.Control
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="Company phone"
                          disabled={!canEditCompanyFields}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="g-3">
                    <Col md={6}>
                      <UseSelect
                        name="country"
                        label="Country"
                        value={country}
                        options={countryOptions}
                        onChange={(value) => setCountry(value)}
                        placeholder="Select a country..."
                        disabled={!canEditCompanyFields}
                      />
                    </Col>
                    <Col md={6}>
                      <UseSelect
                        name="language"
                        label="Language"
                        value={language}
                        options={languageOptions}
                        onChange={(value) => setLanguage(value)}
                        placeholder="Select a Language..."
                        disabled={!canEditCompanyFields}
                      />
                      <Form.Text className="text-700">
                        Preferred language for date, time, and number formatting.
                      </Form.Text>
                    </Col>
                    <Col md={6}>
                      <UseSelect
                        name="timeZone"
                        label="Time Zone"
                        value={timeZone}
                        options={timeZoneOptions}
                        onChange={(value) => setTimeZone(value)}
                        placeholder="Select a Time Zone"
                        disabled={!canEditCompanyFields}
                      />
                    </Col>
                    <Col md={6}>
                      <UseSelect
                        name="currency"
                        label="Currency"
                        value={currency}
                        options={currencyOptions}
                        onChange={(value) => setCurrency(value)}
                        placeholder="Select a currency"
                        disabled={!canEditCompanyFields}
                      />
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Communication</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      <Form.Check
                        type="checkbox"
                        label="Email"
                        checked={commEmail}
                        onChange={(e) => setCommEmail(e.target.checked)}
                        disabled={!canEditCompanyFields}
                      />
                      <Form.Check
                        type="checkbox"
                        label="SMS"
                        checked={commSms}
                        onChange={(e) => setCommSms(e.target.checked)}
                        disabled={!canEditCompanyFields}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Push"
                        checked={commPush}
                        onChange={(e) => setCommPush(e.target.checked)}
                        disabled={!canEditCompanyFields}
                      />
                    </div>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={saving || (isPlatformAdmin && !selectedCompanyId)}>
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving…
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Security Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={passwordSaving}>
                  {passwordSaving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Updating…
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AccountSettings;
