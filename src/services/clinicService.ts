import { ClinicInfo, ClinicInfoFormData } from '../types/clinic';

const CLINIC_INFO_STORAGE_KEY = 'cabinet_medical_clinic_info';

export class ClinicService {
  private static instance: ClinicService;
  private clinicInfo: ClinicInfo;

  private constructor() {
    this.loadClinicInfo();
  }

  public static getInstance(): ClinicService {
    if (!ClinicService.instance) {
      ClinicService.instance = new ClinicService();
    }
    return ClinicService.instance;
  }

  private loadClinicInfo(): void {
    const storedInfo = localStorage.getItem(CLINIC_INFO_STORAGE_KEY);
    if (storedInfo) {
      this.clinicInfo = JSON.parse(storedInfo);
    } else {
      this.clinicInfo = this.getDefaultClinicInfo();
      this.saveClinicInfo();
    }
  }

  private saveClinicInfo(): void {
    localStorage.setItem(CLINIC_INFO_STORAGE_KEY, JSON.stringify(this.clinicInfo));
  }

  private getDefaultClinicInfo(): ClinicInfo {
    return {
      nom: 'Cabinet Médical de Warang',
      adresse: 'Quartier Résidentiel, Avenue Principale, Warang - Sénégal',
      telephone: '+221 33 XXX XX XX',
      email: 'contact@cabinetwarang.sn',
      rccm: 'SN-DKR-2024-A-XXXX',
      ninea: 'XXXXXXXXX',
      site_web: '',
      responsable_medical_nom: 'DIOP',
      responsable_medical_prenom: 'Dr. Amadou'
    };
  }

  public getClinicInfo(): ClinicInfo {
    return { ...this.clinicInfo };
  }

  public updateClinicInfo(clinicData: ClinicInfoFormData): ClinicInfo {
    this.clinicInfo = { ...clinicData };
    this.saveClinicInfo();
    return this.getClinicInfo();
  }

  public resetToDefault(): ClinicInfo {
    this.clinicInfo = this.getDefaultClinicInfo();
    this.saveClinicInfo();
    return this.getClinicInfo();
  }

  public getFormattedHeader(): string {
    return `${this.clinicInfo.nom}
${this.clinicInfo.adresse}
Tél: ${this.clinicInfo.telephone} | Email: ${this.clinicInfo.email}
RC: ${this.clinicInfo.rccm} | NINEA: ${this.clinicInfo.ninea}${this.clinicInfo.site_web ? ` | Web: ${this.clinicInfo.site_web}` : ''}`;
  }

  public getResponsableMedical(): string {
    return `${this.clinicInfo.responsable_medical_prenom} ${this.clinicInfo.responsable_medical_nom}`;
  }
}