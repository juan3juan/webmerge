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
    let G28_I130 = {
      name: "I130",
      id: 482438,
      key: "24kk9b"
    };

    //obtain company & client info through case info record
    //extract company data if not null
    let companyData;
    if (caseInfoData.Related_Company !== null) {
      let companyId = caseInfoData.Related_Company.id;
      let inputCompany = {};
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

      // get beneficiary for the peti
      if (clientData.Beneficiary !== null) {
        let beneId = clientData.Beneficiary.id;
        let inputBene = {};
        inputBene.id = beneId;
        inputBene.module = "Contacts";
        const respBene = await ZCRMRestClient.API.MODULES.get(inputBene);
        beneData = JSON.parse(respBene.body).data[0];
        console.log("beneData.Email :" + beneData.Email);
      }
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

      //G28
      integrateData.G28_P3_6a_FamilyName = clientData.Last_Name;
      integrateData.G28_P3_6b_GivenName = clientData.First_Name;
      integrateData.G28_P3_6c_MiddleName = clientData.Middle_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_11_TelephoneNumber = clientData.Mobile;
      integrateData.G28_P3_12_Email = clientData.Email;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P3_13b = clientData.Mailing_Unit;
      integrateData.G28_P3_13b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P3_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P3_13d_State = clientData.Mailing_State;
      integrateData.G28_P3_13e_ZIPCode = clientData.Mailing_Zip;

      integrateData.P2_10_Gender = clientData.Gender;
      integrateData.P2_11_MaritalStatus = clientData.Marital_Status;
      integrateData.P2_13b_ssn = clientData.SSN;
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
      if (clientData.Date_of_Birth !== null) {
        let temp = clientData.Date_of_Birth.split("-");
        integrateData.P2_20_DOB = temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      integrateData.P2_21a_I94 = clientData.I_94_No;
      integrateData.P2_21b_PassportNumber = clientData.Passport_Number;

      if (clientData.Date_Passport_Expired !== null) {
        let temp = clientData.Date_Passport_Expired.split("-");
        integrateData.P2_21e_ExpirationDateforPassport =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      if (clientData.Date_of_Last_Entry !== null) {
        let temp = clientData.Date_of_Last_Entry.split("-");
        integrateData.P2_22_DateLastArrivalUS =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
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

      //G28
      integrateData.G28_P3_6a_FamilyName = clientData.Last_Name;
      integrateData.G28_P3_6b_GivenName = clientData.First_Name;
      integrateData.G28_P3_6c_MiddleName = clientData.Middle_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_11_TelephoneNumber = clientData.Mobile;
      integrateData.G28_P3_12_Email = clientData.Email;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P3_13b = clientData.Mailing_Unit;
      integrateData.G28_P3_13b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P3_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P3_13d_State = clientData.Mailing_State;
      integrateData.G28_P3_13e_ZIPCode = clientData.Mailing_Zip;

      integrateData.P1_2i_Country = clientData.Mailing_Country;
      integrateData.P1_4_CountryOfBirth = clientData.Country_of_Birth;
      integrateData.P1_5_CountryOfCitizenship =
        clientData.Country_of_Citizenship;
      integrateData.P1_7_Gender = clientData.Gender;
      if (clientData.Date_of_Birth !== null) {
        let temp = clientData.Date_of_Birth.split("-");
        integrateData.P1_8_DOB = temp[1] + "/" + temp[2] + "/" + temp[0];
      }
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
      if (caseData.Date_of_Intended_Departure !== null) {
        let temp = caseData.Date_of_Intended_Departure.split("-");
        integrateData.P3_1_DateIntendedDeparture =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }

      integrateData.P3_2_ExpectedTripLength =
        caseData.Exected_Length_of_Trips_in_days;
    }
    // ~~~~~~~~~~~~~~~~~~~~~~ H1B ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    else if (input.document == "G28_H1B") {
      testfile = G28_H1B;

      //G28
      integrateData.G28_P3_6a_FamilyName = caseInfoData.Petitioner_Last_Name;
      integrateData.G28_P3_6b_GivenName = caseInfoData.Petitioner_First_Name;
      integrateData.G28_P3_6c_MiddleName = caseInfoData.Petitioner_Middle_Name;
      integrateData.G28_P3_7a_CompanyName = caseInfoData.Company_Name;
      integrateData.G28_P3_7b_PetitionerTitle =
        caseInfoData.Petitioner_Full_Name_w_Title;
      integrateData.G28_P3_10_DaytimeTelephone =
        caseInfoData.Petitioner_Daytime_Phone;
      console.log("integrateData.G28_P3_10_DaytimeTelephone~~~~~~~~~~~~~~~~");

      console.log(integrateData.G28_P3_10_DaytimeTelephone);
      integrateData.G28_P3_13a_Street = caseInfoData.Petitioner_Street_Address;
      integrateData.G28_P3_13b = caseInfoData.Petitioner_Unit;
      integrateData.G28_P3_13b_Address = caseInfoData.Petitioner_Unit_Number;
      integrateData.G28_P3_13c_CityOrTown = caseInfoData.Petitioner_City;
      integrateData.G28_P3_13d_State = caseInfoData.Petitioner_State;
      integrateData.G28_P3_13e_ZIPCode = caseInfoData.Petitioner_Zip_Code;

      integrateData.I129_P1_FEIN = caseInfoData.FEIN;
      integrateData.I129_P2_L3_recentPetitionNumber =
        caseInfoData.Recent_Petition_Number;
      integrateData.I129_P2_L4_RequestAction = caseInfoData.Requested_Action;
      integrateData.I129_P3_Line2_FamilyName = caseInfoData.Last_Name;
      integrateData.I129_P3_Line2_GivenName = caseInfoData.First_Name;
      integrateData.I129_P3_Line2_MiddleName = caseInfoData.Middle_Name;
      if (caseInfoData.D_O_B !== null) {
        let temp = caseInfoData.D_O_B.split("-");
        integrateData.I129_P3_Line4_DateOfBirth =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      integrateData.I129_P3_L4_Gender = caseInfoData.Gender;
      integrateData.I129_P3_Line4_SSN = caseInfoData.S_S_N;
      integrateData.I_129_P3_Line4_CountryOfBirth =
        caseInfoData.Country_of_Birth;
      integrateData.I_129_P3_Line4_DProvince = caseInfoData.Province_of_Birth;
      integrateData.I_129_P3_Line4_Nationality =
        caseInfoData.Country_of_Citizenship;

      if (caseInfoData.Date_of_Last_Arrival !== null) {
        let temp = caseInfoData.Date_of_Last_Arrival.split("-");
        integrateData.I_129_P3_Line5_DateofArrival =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      integrateData.I_129_P3_Line5_ArrivalDeparture = caseInfoData.I_94_No;
      integrateData.I_129_P3_Line5_PassportorTravDoc = caseInfoData.Passport_No;
      if (caseInfoData.Date_Passport_Issued !== null) {
        let temp = caseInfoData.Date_Passport_Issued.split("-");
        integrateData.I_129_P3_Line5_IssueDate =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      if (caseInfoData.Date_Passport_Expires !== null) {
        let temp = caseInfoData.Date_Passport_Expires.split("-");
        integrateData.I_129_P3_Line5_ExpDate =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      integrateData.I_129_P3_Line5_CurrentNon = caseInfoData.Current_Status;
      if (caseInfoData.Date_Status_Expires !== null) {
        let temp = caseInfoData.Date_Status_Expires.split("-");
        integrateData.I_129_P3_Line5_DateStatusExpires =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
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

      if (caseInfoData.Start_From !== null) {
        let temp = caseInfoData.Start_From.split("-");
        integrateData.I_129_P5_L11_DateFrom =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      if (caseInfoData.To !== null) {
        let temp = caseInfoData.To.split("-");
        integrateData.I_129_P5_L11_DateTo =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
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

      if (caseInfoData.Medicaid_Exempt_Start_Date !== null) {
        let temp = caseInfoData.Medicaid_Exempt_Start_Date.split("-");
        integrateData.MedicaidStartDate =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }
      if (caseInfoData.Medicaid_Exempt_End_Date !== null) {
        let temp = caseInfoData.Medicaid_Exempt_End_Date.split("-");
        integrateData.MedicaidEndDate = temp[1] + "/" + temp[2] + "/" + temp[0];
      }
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
      if (caseInfoData.Date_Degree_Awarded !== null) {
        let temp = caseInfoData.Date_Degree_Awarded.split("-");
        integrateData.I_129_SP_S3_L2b_DateDegreeAwarded =
          temp[1] + "/" + temp[2] + "/" + temp[0];
      }

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
    // ~~~~~~~~~~~~~~~~~~~~~~ 130 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    else if (input.document == "G28_I130") {
      testfile = G28_I130;

      //G28
      integrateData.G28_P3_6a_FamilyName = clientData.Last_Name;
      integrateData.G28_P3_6b_GivenName = clientData.First_Name;
      integrateData.G28_P3_6c_MiddleName = clientData.Middle_Name;
      integrateData.G28_P3_10_DaytimeTelephone = clientData.Phone;
      integrateData.G28_P3_11_TelephoneNumber = clientData.Mobile;
      integrateData.G28_P3_12_Email = clientData.Email;
      integrateData.G28_P3_13a_Street = clientData.Mailing_Street;
      integrateData.G28_P3_13b = clientData.Mailing_Unit;
      integrateData.G28_P3_13b_Address = clientData.Mailing_Unit_Number;
      integrateData.G28_P3_13c_CityOrTown = clientData.Mailing_City;
      integrateData.G28_P3_13d_State = clientData.Mailing_State;
      integrateData.G28_P3_13e_ZIPCode = clientData.Mailing_Zip;

      integrateData.P2_10_Gender = clientData.Gender;
      integrateData.P2_11_MaritalStatus = clientData.Marital_Status;
      integrateData.P2_13b_ssn = clientData.SSN;
      //A-number
      let ANumber = clientData.A_Number;
      if (ANumber !== null) {
        ANumber = ANumber.trim().replace(/\s/g, ""); //remove blank front, end and between
        if (ANumber !== null || ANumber !== "") {
          if (ANumber.charAt(0) === "A" || ANumber.charAt(0) === "a")
            ANumber = ANumber.substring(1);
        }
        integrateData.G28_P3_9_ClientANumber = ANumber;
      }

      integrateData.P1_1_applyFor = caseData.Relationship;
      integrateData.P1_2_ChildParent = caseData.Child_Parent_Relationship;
      integrateData.BrotherSister = caseData.Sibling_Related_by_adoption;
      integrateData.P1_4_PROrCitizenThroughAdoption =
        caseData.Gain_PR_Citizen_Through_Adoption;
      integrateData.P2_3_ssn = clientData.SSN;
      integrateData.P2_5a_FamilyName = clientData.Other_Last_Name_1;
      integrateData.P2_5b_GivenName = clientData.Other_First_Name_1;
      integrateData.P2_6_CityTownVillageOfBirth = clientData.City_of_Birth;
      integrateData.P2_7_CountryOfBirth = clientData.Country_of_Birth;
      if (clientData.Date_of_Birth !== null) {
        let tempP2_8_DOB = clientData.Date_of_Birth.split("-");
        integrateData.P2_8_DOB =
          tempP2_8_DOB[1] + "/" + tempP2_8_DOB[2] + "/" + tempP2_8_DOB[0];
      }

      integrateData.P2_9_Sex = clientData.Gender;
      integrateData.P2_10a_InCareOfName =
        clientData.First_Name + " " + clientData.Last_Name;
      integrateData.P2_11_MailingSamePhysical =
        clientData.Is_mailing_address_same_as_physical_address;
      if (integrateData.P2_11_MailingSamePhysical === "No") {
        integrateData.P2_12a_Street = clientData.Other_Street;
        integrateData.P2_12b = clientData.Other_Unit;
        integrateData.P2_12b_Address = clientData.Other_Unit_Number;
        integrateData.P2_12c_CityOrTown = clientData.Other_City;
        integrateData.P2_12d_State = clientData.Other_State;
        integrateData.P2_12e_ZIPCode = clientData.Other_Zip;
        integrateData.P2_12h_Country = clientData.Other_Country;
        integrateData.P2_10g_Province = clientData.Other_Province;
        integrateData.P2_10h_PostalCode = clientData.Other_Postal_Code;
      }
      integrateData.P2_10g_Province = clientData.Mailing_Province;
      integrateData.P2_10h_PostalCode = clientData.Mailing_Postal_Code;

      integrateData.P2_10i_Country = clientData.Mailing_Country;
      integrateData.P2_17_MaritalStatus = clientData.Marital_Status;
      // parents
      integrateData.P2_24a_FamilyName = clientData.Father_s_Last_Name;
      integrateData.P2_24b_GivenName = clientData.Father_s_First_Name;
      integrateData.P2_26_Sex = "Male";
      integrateData.P2_30a_FamilyName = clientData.Mother_s_Last_Name;
      integrateData.P2_30b_GivenName = clientData.Mother_s_First_Name;
      integrateData.P2_32_Sex = "Female";
      //additional for peti
      integrateData.P2_36_CitizenOrPR = clientData.US_Citizen_PR;
      integrateData.P2_37_CitizenshipAcquiredWays =
        clientData.Acquire_citizenship_through;
      integrateData.P2_38_ObtainCertificateOfNutralizationOrCitizenship =
        clientData.Obtained_Certificate_of_Naturalization_or_Citizens;
      integrateData.P2_39a_CertificateNumber =
        clientData.Citizenship_Certificate_Number;
      integrateData.P2_40a_ClassOfAdmission = clientData.PR_Class_of_Admission;
      integrateData.P2_41_PRFromMarriage = clientData.PR_Through_Marriage;

      // Beneficiary
      if (beneData !== null) {
        integrateData.P4_4a_FamilyName = beneData.Last_Name;
        integrateData.P4_4b_GivenName = beneData.First_Name;
        integrateData.P4_5a_FamilyName = beneData.Other_Last_Name_1;
        integrateData.P4_5b_GivenName = beneData.Other_First_Name_1;
        integrateData.P4_6_CityTownVillageOfBirth = beneData.City_of_Birth;
        integrateData.P4_7_CountryOfBirth = beneData.Country_of_Birth;
        if (beneData.Date_of_Birth !== null) {
          let tempP4_8_DOB = beneData.Date_of_Birth.split("-");
          integrateData.P4_8_DOB =
            tempP4_8_DOB[1] + "/" + tempP4_8_DOB[2] + "/" + tempP4_8_DOB[0];
        }
        integrateData.P4_9_Sex = beneData.Gender;

        integrateData.P4_10_EverFiledPetiForBene =
          beneData.Anyone_Filed_for_This_Beneficiary_Before;

        integrateData.P4_11a_Street = beneData.Mailing_Street;
        integrateData.P4_11b = beneData.Mailing_Unit;
        integrateData.P4_11b_Address = beneData.Mailing_Unit_Number;
        integrateData.P4_11c_CityOrTown = beneData.Mailing_City;
        integrateData.P4_11d_State = beneData.Mailing_State;
        integrateData.P4_11e_ZIPCode = beneData.Mailing_Zip;
        integrateData.P4_11f_Province = beneData.Mailing_Province;
        integrateData.P4_11g_PostalCode = beneData.Mailing_Postal_Code;
        integrateData.P4_11h_Country = beneData.Mailing_Country;

        integrateData.P4_12a_Street = beneData.Other_Street;
        integrateData.P4_12b = beneData.Other_Unit;
        integrateData.P4_12b_Address = beneData.Other_Unit_Number;
        integrateData.P4_12c_CityOrTown = beneData.Other_City;
        integrateData.P4_12d_State = beneData.Other_State;
        integrateData.P4_12e_ZIPCode = beneData.Other_Zip;
        integrateData.P2_12h_Country = beneData.Other_Country;
        integrateData.P4_14_DaytimeTelephone = beneData.Phone;
        integrateData.P4_15_MobileTelephone = beneData.Mobile;
        integrateData.P4_16_Email = beneData.Email;
        integrateData.P4_18_MaritalStatus = beneData.Marital_Status;
        integrateData.P4_45_EverInUS = beneData.Was_Beneficiary_ever_in_the_US;
        integrateData.P4_46_ClassOfAdmission = beneData.Status_of_Last_Entry;
        integrateData.P4_46b_I94 = beneData.I_94_No;

        if (beneData.Date_of_Last_Entry !== null) {
          let tempP4_46c_DateOfArrival = beneData.Date_of_Last_Entry.split("-");
          integrateData.P4_46c_DateOfArrival =
            tempP4_46c_DateOfArrival[1] +
            "/" +
            tempP4_46c_DateOfArrival[2] +
            "/" +
            tempP4_46c_DateOfArrival[0];
        }
        if (
          beneData.Current_Status_Expires !== undefined &&
          beneData.Current_Status_Expires !== null
        ) {
          let tempP4_46d_DateOfExpired = beneData.Current_Status_Expires.split(
            "-"
          );
          integrateData.P4_46d_DateOfExpired =
            tempP4_46d_DateOfExpired[1] +
            "/" +
            tempP4_46d_DateOfExpired[2] +
            "/" +
            tempP4_46d_DateOfExpired[0];
        }
        integrateData.P4_47_PassportNumber = beneData.Passport_Number;
        integrateData.P4_48_TravelDocumentNumber =
          beneData.Travel_Document_Number;
        integrateData.P4_49_CountryIssuedPassport =
          beneData.Country_Passport_Issued;
        if (beneData.Date_Passport_Expired !== null) {
          let tempP4_50_ExpirationDateforPassport = beneData.Date_Passport_Expired.split(
            "-"
          );
          integrateData.P4_50_ExpirationDateforPassport =
            tempP4_50_ExpirationDateforPassport[1] +
            "/" +
            tempP4_50_ExpirationDateforPassport[2] +
            "/" +
            tempP4_50_ExpirationDateforPassport[0];
        }
        integrateData.P4_53_EverInImmigration =
          beneData.EVER_in_immigration_proceedings;
        integrateData.P4_54_typeOfProceedings = beneData.Type_of_Proceedings;
        integrateData.P4_55a_CityOrTown = beneData.Proceedings_City_Or_Town;
        integrateData.P4_55b_State = beneData.Proceedings_State;
        if (beneData.Proceedings_Date !== null) {
          let tempP4_56_Date = beneData.Proceedings_Date.split("-");
          integrateData.P4_56_Date =
            tempP4_56_Date[1] +
            "/" +
            tempP4_56_Date[2] +
            "/" +
            tempP4_56_Date[0];
        }
        integrateData.P5_1_EverFiledPetiForTheBene =
          beneData.Ever_Filed_Petition_For_The_Beneficiary;
      }
      //company
      if (companyData !== undefined && companyData !== null) {
        integrateData.P2_42_Employer = companyData.Account_Name;
        integrateData.P2_43a_Street = companyData.Billing_Street;
        integrateData.P2_43b = companyData.Billing_Unit;
        integrateData.P2_43b_Address = companyData.Billing_Unit_Number;
        integrateData.P2_43c_CityOrTown = companyData.Billing_City;
        integrateData.P2_43d_State = companyData.Billing_State;
        integrateData.P2_43e_ZIPCode = companyData.Billing_Code;
        integrateData.P2_43h_Country = companyData.Billing_Country;
      }
      integrateData.P2_44_Occupation = caseData.Occupation_Title;
    }

    return [integrateData, testfile];
  }
};
