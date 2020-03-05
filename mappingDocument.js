const ZCRMRestClient = require("zcrmsdk");

module.exports = {
  mappingData: async function(input, caseInfoData) {
    //these two are the output of the function
    let integrateData = {}; //integrate data from different modules
    let testfile = {}; //choose testfile

    let testfile_G28_I765_test = {
      name: "I765",
      id: 323297,
      key: "4mxuat"
    };
    let G28_I131 = {
      name: "I131",
      id: 394665,
      key: "szph16"
    };
    let G28_H1B = {
      name: "H1B",
      id: 446249,
      key: "6unp63"
    };

    //obtain company & client info through case info record
    //extract company data if not null
    let companyData;
    if (caseInfoData.Related_Company !== null) {
      let companyId = caseInfoData.Related_Company.id;
      inputCompany.id = companyId;
      inputCompany.module = "Accounts";
      const respCompany = await ZCRMRestClient.API.MODULES.get(inputCompany);
      companyData = JSON.parse(respCompany.body).data[0];
      console.log("companyData.Account_Name :" + companyData.Account_Name);
    }

    //extract client data
    let clientData;
    if (caseInfoData.Related_Client !== null) {
      let clientId = caseInfoData.Related_Client.id;
      let inputClient = {};
      inputClient.id = clientId;
      inputClient.module = "Contacts";
      const respClient = await ZCRMRestClient.API.MODULES.get(inputClient);
      clientData = JSON.parse(respClient.body).data[0];
      console.log("clientData.Email :" + clientData.Email);
    }

    //extract related case data
    let caseData;
    if (caseInfoData.Related_Case !== null) {
      let caseId = caseInfoData.Related_Case.id;
      let inputCase = {};
      inputCase.id = caseId;
      inputCase.module = "Deals";
      const respCase = await ZCRMRestClient.API.MODULES.get(inputCase);
      caseData = JSON.parse(respCase.body).data[0];
      console.log("caseData.Case_Number :" + caseData.Case_Number);
      integrateData.CaseMmgID = caseData.id;
    }

    if (input.document == "G28_I765_test") {
      testfile = testfile_G28_I765_test;

      integrateData.G28_P3_6a_FamilyName = clientData.Last_Name;
      integrateData.G28_P3_6b_GivenName = clientData.First_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.P2_10_Gender = clientData.Gender;
      integrateData.P2_11_MaritalStatus = clientData.Marital_Status;
      integrateData.P2_13b_ssn = clientData.SSN;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P1_13b = clientData.Mailing_Unit;
      integrateData.G28_P1_3b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P1_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P1_13d_State = clientData.Mailing_State;
      integrateData.G28_P1_13e_ZIPCode = clientData.Mailing_Zip;
      integrateData.P2_5a_InCareOfName =
        clientData.First_Name + " " + clientData.Last_Name;
      integrateData.P2_16a_FatherFamilyName = clientData.Father_s_Last_Name;
      integrateData.P2_16b_FatherFirstName = clientData.Father_s_First_Name;
      integrateData.P2_17a_MotherFamilyName = clientData.Mother_s_Last_Name;
      integrateData.P2_17b_MotherFirstName = clientData.Mother_s_First_Name;
      integrateData.P2_18a_Country = clientData.Country_of_Citizenship;
      integrateData.P2_19a_CityTownVillageOfBirth = clientData.City_of_Birth;
      integrateData.P2_19b_StateProvinceOfBirth = clientData.Province_of_Birth;
      integrateData.P2_19c_CountryOfBirth = clientData.Country_of_Birth;
      integrateData.P2_20_DOB = clientData.Date_of_Birth;
      integrateData.P2_21a_I94 = clientData.I_94_No;
      integrateData.P2_21b_PassportNumber = clientData.Passport_Number;
      integrateData.P2_21e_ExpirationDateforPassport =
        clientData.Date_Passport_Expired;
      integrateData.P2_22_DateLastArrivalUS = clientData.Date_of_Last_Entry;
      integrateData.P2_23_PlaceLastArrivalUS = clientData.Place_of_Last_Entry;
      integrateData.P2_24_statusLastArrival = clientData.Status_of_Last_Entry;
      integrateData.P2_25_statusCurrent = clientData.Current_Status;
      // special process for ANumber, remove blank and A/a in the front
      console.log("clientData.A_Number");
      console.log(clientData.A_Number);

      let ANumber = clientData.A_Number;
      if (ANumber !== null) {
        console.log("clientData.A_Number inside");

        ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (ANumber !== null || ANumber !== "") {
          if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
            ANumber = ANumber.substring(1);
        }
        integrateData.G28_P3_9_ClientANumber = ANumber;
      }

      // special process for SEVIS, remove blank and N/n in the front
      let SEVIS = clientData.SEVIS_No;
      if (SEVIS !== null) {
        SEVIS = SEVIS.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (SEVIS !== null || SEVIS !== "") {
          if (SEVIS.charAt(0) === "N" || SEVIS.charAt(0) === "n")
            SEVIS = SEVIS.substring(1);
        }
        integrateData.P2_26_SEVIS = SEVIS;
      }

      // from company
      integrateData.P2_28b_EmployersName = companyData.Account_Number;
      integrateData.P2_28c_EmployersID = companyData.E_Verify_ID;
      // from caseInfo
      integrateData.P2_27_EligibilityCategory =
        caseInfoData.Eligibility_Category;
      integrateData.P2_28a_Degree = caseInfoData.Type_of_U_S_Degree;
      integrateData.P2_13a_ssnBefore = caseInfoData.Has_SSA;
      integrateData.P2_12_I765Before =
        caseInfoData.Any_Same_Category_Petition_Before;
      integrateData.P5_1a_PreparersFamilyName = caseInfoData.Preparer_Last_Name;
      integrateData.P5_1b_PreparersFirstName = caseInfoData.Preparer_First_Name;

      integrateData.P2_2a_FamilyName = clientData.Other_Last_Name_1;
      integrateData.P2_2b_FirstName = clientData.Other_First_Name_1;
      integrateData.Same_as_mailing_address =
        clientData.Is_mailing_address_same_as_physical_address;
      integrateData.P2_7a_Street = clientData.Other_Street;
      integrateData.P2_7b = clientData.Other_Unit;
      integrateData.P2_7b_Address = clientData.Other_Unit_Number;
      integrateData.P2_7c_CityOrTown = clientData.Other_City;
      integrateData.P2_7d_State = clientData.Other_State;
      integrateData.P2_7e_ZIPCode = clientData.Other_Zip;
      integrateData.P2_31a_PrincipleReceiptNumber =
        clientData.Principle_Receipt_Number;
    } else if (input.document == "G28_I131") {
      testfile = G28_I131;

      integrateData.G28_P3_6a_FamilyName = clientData.First_Name;
      integrateData.G28_P3_6b_GivenName = clientData.Last_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P1_13b = clientData.Mailing_Unit;
      integrateData.G28_P1_3b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P1_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P1_13d_State = clientData.Mailing_State;
      integrateData.G28_P1_13e_ZIPCode = clientData.Mailing_Zip;
      integrateData.P1_2i_Country = clientData.Mailing_Country;
      integrateData.P1_4_CountryOfBirth = clientData.Country_of_Birth;
      integrateData.P1_5_CountryOfCitizenship =
        clientData.Country_of_Citizenship;
      integrateData.P1_7_Gender = clientData.Gender;
      integrateData.P1_8_DOB = clientData.Date_of_Birth;
      integrateData.P1_9_SSN = clientData.SSN;

      // special process for ANumber, remove blank and A/a in the front
      let ANumber = clientData.A_Number;
      if (ANumber !== null) {
        ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (ANumber !== null || ANumber !== "") {
          if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
            ANumber = ANumber.substring(1);
        }
        console.log("ANumber : " + ANumber);
        integrateData.G28_P3_9_ClientANumber = ANumber;
        let phone = clientData.Phone;
        if (phone !== null && phone.length === 9) {
          integrateData.P8_2_DaytimePhone_part1 = phone.substring(0, 3);
          integrateData.P8_2_DaytimePhone_part2 = phone.substring(3, 6);
          integrateData.P8_2_DaytimePhone_part3 = phone.substring(6);
        }
      }
      integrateData.P3_3a = "No";
      integrateData.P3_4a = "No";
      integrateData.P4_1a_PurposeOfTrip = "Visiting family member and friends";
      integrateData.P1_6_ClassOfAdmission = clientData.Current_Status;
      integrateData.P2_1a_ApplicationType = caseData.I131_Application_Type;
      integrateData.P3_1_DateIntendedDeparture =
        caseData.Date_of_Intended_Departure;
      integrateData.P3_2_ExpectedTripLength =
        caseData.Exected_Length_of_Trips_in_days;
    } else if (input.document == "G28_H1B") {
      testfile = G28_H1B;

      integrateData.G28_P2_L5a_FamilyName = clientData.Last_Name;
      integrateData.G28_P2_L5b_GivenName = clientData.First_Name;
      integrateData.G28_P2_L9_DayTime_Phone = clientData.Phone;
      integrateData.G28_P2_L10_MobilePhone = clientData.Mobile;
      integrateData.G28_P2_L11_Email = clientData.Email;
      integrateData.G28_P2_L12a_StreetNumber = clientData.Mailing_Street;
      integrateData.G28_p2_aptsteflr = clientData.Mailing_Unit;
      integrateData.G28_p2_12b_AptSteFlrNumber = clientData.Mailing_Unit_Number;
      integrateData.G28_p2_12c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_p2_12d_State = clientData.Mailing_State;
      integrateData.G28_p2_12e_ZipCode = clientData.Mailing_Zip;
      // special process for ANumber, remove blank and A/a in the front
      let ANumber = clientData.A_Number;
      if (ANumber !== null) {
        ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (ANumber !== null || ANumber !== "") {
          if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
            ANumber = ANumber.substring(1);
        }
        integrateData.G28_P2_L8_A_Number = ANumber;
      }

      integrateData.G28_P2_L6_CompanyName = caseInfoData.Company_Name;
      integrateData.I129_P1_7a_InCareofName =
        clientData.First_Name + " " + clientData.Last_Name;
      integrateData.I129_P1_FEIN = caseInfoData.FEIN;
      integrateData.I129_P2_L3_recentPetitionNumber =
        caseInfoData.Recent_Petition_Number;
      integrateData.I129_P2_L4_RequestAction = caseInfoData.Requested_Action;
      integrateData.I129_P3_Line2_FamilyName = caseInfoData.Last_Name;
      integrateData.I129_P3_Line2_GivenName = caseInfoData.First_Name;
      integrateData.I129_P3_Line2_MiddleName = caseInfoData.Middle_Name;
      integrateData.I129_P3_Line4_DateOfBirth = caseInfoData.D_O_B;
      integrateData.I129_P3_Line4_SSN = clientData.SSN;
      integrateData.I_129_P3_Line4_CountryOfBirth =
        caseInfoData.Country_of_Birth;
      integrateData.I_129_P3_Line4_DProvince = caseInfoData.Province_of_Birth;
      integrateData.I_129_P3_Line4_Nationality =
        caseInfoData.Country_of_Citizenship;
      integrateData.I_129_P3_Line5_DateofArrival =
        caseInfoData.Date_of_Last_Arrival;
      integrateData.I_129_P3_Line5_ArrivalDeparture = caseInfoData.I_94_No;
      integrateData.I_129_P3_Line5_PassportorTravDoc = caseInfoData.Passport_No;
      integrateData.I_129_P3_Line5_IssueDate =
        caseInfoData.Date_Passport_Issued;
      integrateData.I_129_P3_Line5_ExpDate = caseInfoData.Date_Passport_Expires;
      integrateData.I_129_P3_Line5_CurrentNon = caseInfoData.Current_Status;
      integrateData.I_129_P3_Line5_DateStatusExpires =
        caseInfoData.Date_Status_Expires;
      let SEVIS = clientData.SEVIS_No;
      if (SEVIS !== null) {
        SEVIS = SEVIS.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (SEVIS !== null || SEVIS !== "") {
          if (SEVIS.charAt(0) === "N" || SEVIS.charAt(0) === "n")
            SEVIS = SEVIS.substring(1);
        }
        integrateData.I_129_P3_Line5_SEVIS = SEVIS;
      }

      integrateData.I_129_P3_Line5_EAD = clientData.EAD;
      integrateData.I_129_P3_Line5_StreetNumberName =
        caseInfoData.Current_U_S_Address;
      integrateData.I_129_P3_Line5_aptsteflr = caseInfoData.Current_Unit;
      integrateData.I_129_P3_Line5_AptSteFlrNumber =
        caseInfoData.Current_Unit_Number;
      integrateData.I_129_P3_Line5_CityTown = caseInfoData.Current_City;
      integrateData.I_129_P3_Line5_State = caseInfoData.Current_State;
      integrateData.I_129_P3_Line5_ZipCode = caseInfoData.Current_Zip_Code;
      integrateData.I_129_P4_L1b_OfficeAddressCity = caseInfoData.Office_City;
      integrateData.I_129_P4_L1c_State_or_Country =
        caseInfoData.State_or_Country;
      integrateData.I_129_P4_L1d_StreetNumberName =
        caseInfoData.Foreign_Address;
      integrateData.I_129_P4_L1d_aptsteflr = caseInfoData.Foreign_Unit;
      integrateData.I_129_P4_L1d_AptSteFlrNumber =
        caseInfoData.Foreign_Unit_Number;
      integrateData.I_129_P4_L1d_CityTown = caseInfoData.Foreign_City;
      integrateData.I_129_P4_L1d_Province = caseInfoData.Foreign_Province;
      integrateData.I_129_P4_L1d_PostalCode = caseInfoData.Foreign_Postal_Code;
      integrateData.I_129_P4_L1d_Country = caseInfoData.Foreign_Country;
      integrateData.I_129_P4_L2_ValidPassport = caseInfoData.Valid_Passport;
      integrateData.I_129_P4_L3_Otherpetitions =
        caseInfoData.Other_Petition_with_This_One;
      integrateData.I_129_P4_L4_ObtainI94 = caseInfoData.Replace_I_94;
      integrateData.I_129_P4_L5_Dependents = caseInfoData.Dependents;
      integrateData.I_129_P4_L6_beneficiaryinremoval = caseInfoData.In_Removal;
      integrateData.I_129_P4_L7_AnyImmigrantpetitionforthisposition =
        caseInfoData.Immigrant_Petition_Before;
      integrateData.I_129_P4_L8_Newpositioninpart2 = caseInfoData.New_Petition;
      integrateData.I_129_P4_L8b_SevenYears2 =
        caseInfoData.Any_Denied_H_Petition_in_last_7yrs;
      integrateData.I_129_P4_L9_PreviousPetition =
        caseInfoData.Ever_Filled_a_Petition_for_this_Beneficiary;
      integrateData.I_129_P4_L11a_JVisa = caseInfoData.Any_J_Visa_Before;
      integrateData.I_129_P4_L11b_JVisaStatus =
        caseInfoData.Dates_maintained_J_Status;
      integrateData.I_129_P5_L5_Offsite = caseInfoData.Off_site_Assignment;
      integrateData.I_129_P5_L7_FullTime = caseInfoData.Full_time;
      integrateData.I_129_P5_L8_Hours = caseInfoData.Hours_Per_Week;
      integrateData.I_129_P5_L9_Wages = caseInfoData.Wage;
      integrateData.I_129_P5_L9_Per = caseInfoData.Wage_Unit;
      integrateData.I_129_P5_L11_DateFrom = caseInfoData.F_Start_From;
      integrateData.I_129_P5_L11_DateTo = caseInfoData.F_To;
      integrateData.I_129_P5_L12_TypeofBusiness = caseInfoData.Type_of_Business;
      integrateData.I_129_P5_L13_YearEstablished =
        caseInfoData.Year_Established;
      integrateData.I_129_P5_L14_NumberofEmployees =
        caseInfoData.Total_Number_of_Employee;
      integrateData.I_129_P5_L15_GrossAnnualIncome =
        caseInfoData.Gross_Annual_Income;
      integrateData.I_129_P5_L16_NetAnnualIncome =
        caseInfoData.Net_Annual_Income;
      integrateData.ReceiveAnyBenefits = caseData.Receive_Any_Benefits;
      console.log("Receive_Any_Benefits");
      console.log(caseData.Receive_Any_Benefits);

      // multi-select  page 10
      let abr = caseData.All_Benefits_Received;
      if (abr != null) {
        for (let i = 0; i < abr.length; i++) {
          if (abr[i] === "Cash Assistance")
            integrateData.CashAssistance = "true";
          else if (abr[i] === "SSI") integrateData.SSI = "true";
          else if (abr[i] === "TANF") integrateData.TANF = "true";
          else if (abr[i] === "GA") integrateData.GA = "true";
          else if (abr[i] === "Food Stamps") integrateData.FoodStamps = "true";
          else if (abr[i] === "Housing Assistance")
            integrateData.HousingAssistance = "true";
          else if (abr[i] === "Rental Assistance")
            integrateData.RentalAssistance = "true";
          else if (abr[i] === "Public Housing")
            integrateData.PublicHousing = "true";
          else if (abr[i] === "Federal Medicaid")
            integrateData.FederalMedicaid = "true";
        }
      }
      let be = caseData.Benefits_Exempt;
      if (be != null) {
        for (let i = 0; i < be.length; i++) {
          if (be[i] === "US Armed Force") integrateData.USArmedForce = "true";
          else if (be[i] === "Spouse Child in US Armed Force")
            integrateData.SpouseChildinUSArmedForce = "true";
          else if (be[i] === "Armed Force when Receive")
            integrateData.ArmedForcewhenReceive = "true";
          else if (be[i] === "PCGI Exempt") integrateData.PCGIExempt = "true";
          else if (be[i] === "PCGI Waiver") integrateData.PCGIWaiver = "true";
          else if (be[i] === "Child for N600K")
            integrateData.ChildforN600K = "true";
          else if (be[i] === "None of Above")
            integrateData.NoneofAbove = "true";
        }
      }

      let me = caseData.Medicaid_Exempt;
      if (me != null) {
        for (let i = 0; i < me.length; i++) {
          if (me[i] === "Emergency") integrateData.Emergency = "true";
          else if (me[i] === "IDEA") integrateData.IDEA = "true";
          else if (me[i] === "School Based") integrateData.SchoolBased = "true";
          else if (me[i] === "Under 21") integrateData.Under21 = "true";
          if (me[i] === "60Days following End of Pregnancy")
            integrateData.SixtyDaysfollowingEndofPregnancy = "true";
        }
      }
      integrateData.MedicaidStartDate = caseInfoData.Medicaid_Exempt_Start_Date;
      integrateData.MedicaidEndDate = caseInfoData.Medicaid_Exempt_End_Date;

      integrateData.I129_P7_Line1_PetitionerTitle =
        caseInfoData.Petitioner_Title;
      integrateData.I_129_P8_Line1_PreparerFamilyName =
        caseInfoData.Preparer_Last_Name;
      integrateData.I_129_P8_Line1_PreparerGivenName =
        caseInfoData.Preparer_First_Name;
      integrateData.I_129_SP_L2a_BeneficiaryName = caseInfoData.Full_Name;
      integrateData.I_129_SP_S1_L3c_DOLRequirement =
        caseInfoData.DOL_Requirement;
      integrateData.I_129_SP_S1_L3c1_Over60K = caseInfoData.Over_60K;
      integrateData.I_129_SP_S1_L3c2_HighDegree = caseInfoData.High_Degree;
      integrateData.I_129_SP_S1_L3d_Over50Employee = caseInfoData.or_More;
      integrateData.I_129_SP_S1_L3d1_Over50Per = caseInfoData.More_than_50;
      integrateData.I_129_SP_S1_L2_HighestEducation =
        caseInfoData.Highest_Education;
      integrateData.I_129_SP_S1_L3_Major = caseInfoData.Major_Field;
      integrateData.I_129_SP_S1_L4_RateofPayPerYear =
        caseInfoData.Rate_of_Pay_Per_Year;
      integrateData.I_129_SP_S1_L5_DOTCode = caseInfoData.DOT_Code;
      integrateData.I_129_SP_S1_L6_NAICSCode = caseInfoData.NAICS_Code;
      integrateData.I_129_SP_S2_L9_Less25Employee = caseInfoData.or_Less;
      integrateData.I_129_SP_S3_L1_CAPType = caseInfoData.Type_of_Petition;
      integrateData.I_129_SP_S3_L2a_UniversityName =
        caseInfoData.University_Name;
      integrateData.I_129_SP_S3_L2b_DateDegreeAwarded =
        caseInfoData.Date_Degree_Awarded;
      integrateData.I_129_SP_S3_L2c_TypeofDegree =
        caseInfoData.Type_of_U_S_Degree;
      integrateData.I_129_SP_S3_L2d_UniversityStreetName =
        caseInfoData.University_Address;
      integrateData.I_129_SP_S3_L2d_UniversityUnit =
        caseInfoData.University_Unit;
      integrateData.I_129_SP_S3_L2d_UniversityUnitNumber =
        caseInfoData.University_Unit_Number;
      integrateData.I_129_SP_S3_L2d_UniversityCity =
        caseInfoData.University_City;
      integrateData.I_129_SP_S3_L2d_UniversityState =
        caseInfoData.University_State;
      integrateData.I_129_SP_S3_L2d_UniversityZipCode =
        caseInfoData.University_Zip_Code;
      integrateData.I_129_P5_L5_Offsite = caseInfoData.Off_site_Assignment;
    }

    return [integrateData, testfile];
  }
};
