

-- Create Database
DROP DATABASE IF EXISTS tender_management_system;
CREATE DATABASE tender_management_system;
USE tender_management_system;

-- =====================================================
-- TABLE CREATION SECTION
-- =====================================================

-- 1. ORGANIZATION Table
CREATE TABLE ORGANIZATION (
    Organization_ID INT AUTO_INCREMENT PRIMARY KEY,
    Organization_Name VARCHAR(200) NOT NULL,
    Address TEXT NOT NULL,
    Phone_Number VARCHAR(15) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Registration_Number VARCHAR(50) UNIQUE NOT NULL,
    Organization_Type ENUM('Government', 'Private') NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_org_name (Organization_Name),
    INDEX idx_org_type (Organization_Type)
);

-- 2. TENDER Table
CREATE TABLE TENDER (
    Tender_ID INT AUTO_INCREMENT PRIMARY KEY,
    Tender_Title VARCHAR(300) NOT NULL,
    Description TEXT NOT NULL,
    Tender_Type VARCHAR(100) NOT NULL,
    Publication_Date DATE NOT NULL,
    Submission_Deadline DATETIME NOT NULL,
    Opening_Date DATETIME NOT NULL,
    Estimated_Value DECIMAL(15,2) NOT NULL,
    Document_Fee DECIMAL(10,2) DEFAULT 0.00,
    EMD_Amount DECIMAL(12,2) NOT NULL,
    Status ENUM('Open', 'Closed', 'Awarded', 'Cancelled') DEFAULT 'Open',
    Organization_ID INT NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Organization_ID) REFERENCES ORGANIZATION(Organization_ID),
    INDEX idx_tender_status (Status),
    INDEX idx_submission_deadline (Submission_Deadline),
    INDEX idx_tender_type (Tender_Type),
    CHECK (Estimated_Value > 0),
    CHECK (EMD_Amount >= 0),
    CHECK (Opening_Date > Submission_Deadline)
);

-- 3. BIDDER Table
CREATE TABLE BIDDER (
    Bidder_ID INT AUTO_INCREMENT PRIMARY KEY,
    Company_Name VARCHAR(200) NOT NULL,
    Contact_Person VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Phone_Number VARCHAR(15) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Registration_Number VARCHAR(50) UNIQUE NOT NULL,
    PAN_Number VARCHAR(20) UNIQUE NOT NULL,
    Experience_Years INT DEFAULT 0,
    Annual_Turnover DECIMAL(15,2) DEFAULT 0.00,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_name (Company_Name),
    INDEX idx_experience (Experience_Years),
    CHECK (Experience_Years >= 0),
    CHECK (Annual_Turnover >= 0)
);

-- 4. TENDER_DOCUMENT Table
CREATE TABLE TENDER_DOCUMENT (
    Document_ID INT AUTO_INCREMENT PRIMARY KEY,
    Document_Name VARCHAR(200) NOT NULL,
    Document_Type VARCHAR(50) NOT NULL,
    File_Path VARCHAR(500) NOT NULL,
    Upload_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    File_Size INT DEFAULT 0,
    Tender_ID INT NOT NULL,
    FOREIGN KEY (Tender_ID) REFERENCES TENDER(Tender_ID) ON DELETE CASCADE,
    INDEX idx_document_type (Document_Type),
    CHECK (File_Size >= 0)
);

-- 5. EVALUATION_COMMITTEE Table
CREATE TABLE EVALUATION_COMMITTEE (
    Committee_ID INT AUTO_INCREMENT PRIMARY KEY,
    Committee_Name VARCHAR(200) NOT NULL,
    Formation_Date DATE NOT NULL,
    Chairman_Name VARCHAR(100) NOT NULL,
    Number_of_Members INT NOT NULL,
    Organization_ID INT NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Organization_ID) REFERENCES ORGANIZATION(Organization_ID),
    INDEX idx_formation_date (Formation_Date),
    CHECK (Number_of_Members > 0)
);

-- 6. EVALUATOR Table
CREATE TABLE EVALUATOR (
    Evaluator_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Designation VARCHAR(100) NOT NULL,
    Department VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(15) NOT NULL,
    Experience_Years INT DEFAULT 0,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_evaluator_name (Name),
    INDEX idx_department (Department),
    CHECK (Experience_Years >= 0)
);

-- 7. BID Table
CREATE TABLE BID (
    Bid_ID INT AUTO_INCREMENT PRIMARY KEY,
    Bid_Amount DECIMAL(15,2) NOT NULL,
    Submission_Date DATETIME NOT NULL,
    Technical_Score DECIMAL(5,2) DEFAULT 0.00,
    Financial_Score DECIMAL(5,2) DEFAULT 0.00,
    Total_Score DECIMAL(5,2) DEFAULT 0.00,
    Bid_Status ENUM('Submitted', 'Under_Review', 'Accepted', 'Rejected') DEFAULT 'Submitted',
    EMD_Submitted BOOLEAN DEFAULT FALSE,
    Documents_Attached BOOLEAN DEFAULT FALSE,
    Tender_ID INT NOT NULL,
    Bidder_ID INT NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Tender_ID) REFERENCES TENDER(Tender_ID),
    FOREIGN KEY (Bidder_ID) REFERENCES BIDDER(Bidder_ID),
    INDEX idx_bid_status (Bid_Status),
    INDEX idx_total_score (Total_Score),
    CHECK (Bid_Amount > 0),
    CHECK (Technical_Score >= 0 AND Technical_Score <= 100),
    CHECK (Financial_Score >= 0 AND Financial_Score <= 100),
    CHECK (Total_Score >= 0 AND Total_Score <= 100)
);

-- 8. CONTRACT Table
CREATE TABLE CONTRACT (
    Contract_ID INT AUTO_INCREMENT PRIMARY KEY,
    Contract_Number VARCHAR(100) UNIQUE NOT NULL,
    Award_Date DATE NOT NULL,
    Contract_Value DECIMAL(15,2) NOT NULL,
    Start_Date DATE NOT NULL,
    Completion_Date DATE NOT NULL,
    Performance_Guarantee DECIMAL(12,2) DEFAULT 0.00,
    Contract_Status ENUM('Active', 'Completed', 'Terminated', 'Suspended') DEFAULT 'Active',
    Tender_ID INT UNIQUE NOT NULL,
    Bidder_ID INT NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Tender_ID) REFERENCES TENDER(Tender_ID),
    FOREIGN KEY (Bidder_ID) REFERENCES BIDDER(Bidder_ID),
    INDEX idx_contract_status (Contract_Status),
    INDEX idx_completion_date (Completion_Date),
    CHECK (Contract_Value > 0),
    CHECK (Completion_Date > Start_Date),
    CHECK (Performance_Guarantee >= 0)
);

-- 9. PAYMENT Table
CREATE TABLE PAYMENT (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Payment_Amount DECIMAL(15,2) NOT NULL,
    Payment_Date DATE NOT NULL,
    Payment_Type ENUM('Advance', 'Running', 'Final') NOT NULL,
    Invoice_Number VARCHAR(100) UNIQUE NOT NULL,
    Payment_Status ENUM('Pending', 'Processed', 'Completed', 'Failed') DEFAULT 'Pending',
    Contract_ID INT NOT NULL,
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Contract_ID) REFERENCES CONTRACT(Contract_ID),
    INDEX idx_payment_status (Payment_Status),
    INDEX idx_payment_date (Payment_Date),
    CHECK (Payment_Amount > 0)
);

-- =====================================================
-- JUNCTION TABLES FOR MANY-TO-MANY RELATIONSHIPS
-- =====================================================

-- 10. BIDDER_TENDER_PARTICIPATION (Many-to-Many)
CREATE TABLE BIDDER_TENDER_PARTICIPATION (
    Participation_ID INT AUTO_INCREMENT PRIMARY KEY,
    Bidder_ID INT NOT NULL,
    Tender_ID INT NOT NULL,
    Registration_Date DATE NOT NULL,
    Document_Purchase_Date DATE,
    Pre_Qualification_Status ENUM('Qualified', 'Disqualified', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (Bidder_ID) REFERENCES BIDDER(Bidder_ID),
    FOREIGN KEY (Tender_ID) REFERENCES TENDER(Tender_ID),
    UNIQUE KEY unique_participation (Bidder_ID, Tender_ID),
    INDEX idx_registration_date (Registration_Date)
);

-- 11. COMMITTEE_EVALUATOR_MEMBERSHIP (Many-to-Many)
CREATE TABLE COMMITTEE_EVALUATOR_MEMBERSHIP (
    Membership_ID INT AUTO_INCREMENT PRIMARY KEY,
    Committee_ID INT NOT NULL,
    Evaluator_ID INT NOT NULL,
    Role VARCHAR(100) DEFAULT 'Member',
    Joining_Date DATE NOT NULL,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    FOREIGN KEY (Committee_ID) REFERENCES EVALUATION_COMMITTEE(Committee_ID),
    FOREIGN KEY (Evaluator_ID) REFERENCES EVALUATOR(Evaluator_ID),
    UNIQUE KEY unique_membership (Committee_ID, Evaluator_ID),
    INDEX idx_joining_date (Joining_Date)
);

-- 12. TENDER_COMMITTEE_EVALUATION (One-to-Many with attributes)
CREATE TABLE TENDER_COMMITTEE_EVALUATION (
    Evaluation_ID INT AUTO_INCREMENT PRIMARY KEY,
    Tender_ID INT NOT NULL,
    Committee_ID INT NOT NULL,
    Evaluation_Start_Date DATE NOT NULL,
    Evaluation_End_Date DATE,
    Evaluation_Status ENUM('Not_Started', 'In_Progress', 'Completed') DEFAULT 'Not_Started',
    Final_Recommendation TEXT,
    FOREIGN KEY (Tender_ID) REFERENCES TENDER(Tender_ID),
    FOREIGN KEY (Committee_ID) REFERENCES EVALUATION_COMMITTEE(Committee_ID),
    INDEX idx_evaluation_status (Evaluation_Status)
);

-- 13. EVALUATOR_BID_REVIEW (Many-to-Many)
CREATE TABLE EVALUATOR_BID_REVIEW (
    Review_ID INT AUTO_INCREMENT PRIMARY KEY,
    Evaluator_ID INT NOT NULL,
    Bid_ID INT NOT NULL,
    Review_Date DATE NOT NULL,
    Technical_Marks DECIMAL(5,2) DEFAULT 0.00,
    Financial_Marks DECIMAL(5,2) DEFAULT 0.00,
    Comments TEXT,
    Review_Status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (Evaluator_ID) REFERENCES EVALUATOR(Evaluator_ID),
    FOREIGN KEY (Bid_ID) REFERENCES BID(Bid_ID),
    UNIQUE KEY unique_review (Evaluator_ID, Bid_ID),
    INDEX idx_review_date (Review_Date),
    CHECK (Technical_Marks >= 0 AND Technical_Marks <= 100),
    CHECK (Financial_Marks >= 0 AND Financial_Marks <= 100)
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert Organizations
INSERT INTO ORGANIZATION (Organization_Name, Address, Phone_Number, Email, Registration_Number, Organization_Type) VALUES
('Ministry of Railways', 'Rail Bhawan, New Delhi', '+91-11-23384952', 'info@indianrailways.gov.in', 'MOR2024001', 'Government'),
('National Highways Authority of India', 'G-5&6, Sector-10, Dwarka, New Delhi', '+91-11-25074100', 'info@nhai.gov.in', 'NHAI2024002', 'Government'),
('Delhi Metro Rail Corporation', 'Metro Bhawan, Fire Brigade Lane, New Delhi', '+91-11-23417910', 'info@delhimetrorail.com', 'DMRC2024003', 'Government'),
('State Bank of India', 'Corporate Centre, Madame Cama Road, Mumbai', '+91-22-22202426', 'info@sbi.co.in', 'SBI2024004', 'Government'),
('Reliance Industries Limited', '3rd Floor, Maker Chambers IV, Mumbai', '+91-22-30386000', 'investors@ril.com', 'RIL2024005', 'Private');

-- Insert Bidders
INSERT INTO BIDDER (Company_Name, Contact_Person, Address, Phone_Number, Email, Registration_Number, PAN_Number, Experience_Years, Annual_Turnover) VALUES
('Larsen & Toubro Limited', 'A.M. Naik', 'L&T House, N.M. Marg, Mumbai', '+91-22-66752500', 'info@larsentoubro.com', 'LT2024001', 'AABCL1234C', 15, 150000000000.00),
('Tata Consultancy Services', 'Rajesh Gopinathan', 'TCS House, Raveline Street, Mumbai', '+91-22-67786969', 'info@tcs.com', 'TCS2024002', 'AABCT1234D', 20, 220000000000.00),
('Infosys Limited', 'Salil Parekh', 'Electronics City, Hosur Road, Bangalore', '+91-80-28520261', 'info@infosys.com', 'INFY2024003', 'AABCI1234E', 18, 160000000000.00),
('HCL Technologies', 'C. Vijayakumar', 'HCL Comnet, Noida', '+91-120-2520000', 'info@hcl.com', 'HCL2024004', 'AABCH1234F', 12, 110000000000.00),
('Wipro Limited', 'Thierry Delaporte', 'Doddakannelli, Bangalore', '+91-80-28440011', 'info@wipro.com', 'WIPRO2024005', 'AABCW1234G', 25, 90000000000.00),
('Tech Mahindra', 'C.P. Gurnani', 'Rajiv Gandhi Salai, Chennai', '+91-44-42007000', 'info@techmahindra.com', 'TM2024006', 'AABCT1234H', 10, 65000000000.00),
('Bharti Airtel', 'Gopal Vittal', 'Bharti Crescent, New Delhi', '+91-11-46666100', 'info@airtel.com', 'AIRTEL2024007', 'AABCA1234I', 22, 120000000000.00);

-- Insert Tenders
INSERT INTO TENDER (Tender_Title, Description, Tender_Type, Publication_Date, Submission_Deadline, Opening_Date, Estimated_Value, Document_Fee, EMD_Amount, Status, Organization_ID) VALUES
('Supply of Railway Coaches', 'Procurement of 500 new railway coaches for passenger services across Indian Railways network', 'Supply', '2024-01-15', '2024-02-15 17:00:00', '2024-02-16 11:00:00', 5000000000.00, 50000.00, 25000000.00, 'Open', 1),
('Highway Construction Project NH-44', 'Construction of 100km stretch of National Highway between Delhi-Agra with 6-lane configuration', 'Construction', '2024-01-20', '2024-03-01 17:00:00', '2024-03-02 11:00:00', 8000000000.00, 100000.00, 40000000.00, 'Open', 2),
('Delhi Metro Phase-5 Signaling System', 'Installation and commissioning of advanced signaling system for Delhi Metro Phase-5 corridors', 'Technology', '2024-02-01', '2024-03-15 17:00:00', '2024-03-16 11:00:00', 2500000000.00, 75000.00, 12500000.00, 'Open', 3),
('Core Banking Software Upgrade', 'Modernization of core banking platform with cloud-native architecture and digital banking features', 'Software', '2024-02-10', '2024-03-20 17:00:00', '2024-03-21 11:00:00', 1500000000.00, 25000.00, 7500000.00, 'Open', 4),
('Petrochemical Plant Automation', 'Complete automation and digitization of petrochemical manufacturing processes', 'Technology', '2024-02-15', '2024-03-25 17:00:00', '2024-03-26 11:00:00', 3500000000.00, 60000.00, 17500000.00, 'Open', 5);

-- Insert Tender Documents
INSERT INTO TENDER_DOCUMENT (Document_Name, Document_Type, File_Path, File_Size, Tender_ID) VALUES
('Technical Specifications for Railway Coaches', 'Technical', '/documents/tender1/tech_specs.pdf', 2048576, 1),
('Financial Terms and Conditions', 'Financial', '/documents/tender1/financial_terms.pdf', 1048576, 1),
('Pre-Qualification Criteria', 'Eligibility', '/documents/tender1/prequalification.pdf', 512000, 1),
('Highway Construction Standards', 'Technical', '/documents/tender2/construction_standards.pdf', 3145728, 2),
('Environmental Clearance Requirements', 'Legal', '/documents/tender2/env_clearance.pdf', 1572864, 2),
('Bill of Quantities', 'Financial', '/documents/tender2/boq.xlsx', 2097152, 2),
('Signaling System Technical Specifications', 'Technical', '/documents/tender3/signaling_specs.pdf', 4194304, 3),
('Integration Requirements', 'Technical', '/documents/tender3/integration_req.pdf', 1048576, 3),
('Core Banking Functional Requirements', 'Technical', '/documents/tender4/functional_req.pdf', 2621440, 4),
('Data Migration Guidelines', 'Technical', '/documents/tender4/data_migration.pdf', 1310720, 4),
('Automation System Architecture', 'Technical', '/documents/tender5/system_architecture.pdf', 3670016, 5),
('Safety and Compliance Standards', 'Legal', '/documents/tender5/safety_standards.pdf', 2097152, 5);

-- Insert Evaluation Committees
INSERT INTO EVALUATION_COMMITTEE (Committee_Name, Formation_Date, Chairman_Name, Number_of_Members, Organization_ID) VALUES
('Railway Procurement Committee - Rolling Stock', '2024-01-10', 'Dr. Rajesh Kumar', 7, 1),
('Highway Construction Evaluation Panel', '2024-01-15', 'Eng. Priya Sharma', 5, 2),
('Metro Technology Assessment Committee', '2024-01-25', 'Mr. Anish Gupta', 6, 3),
('Banking IT Evaluation Board', '2024-02-05', 'Mrs. Sunita Rani', 8, 4),
('Industrial Automation Review Panel', '2024-02-10', 'Dr. Vikram Singh', 5, 5);

-- Insert Evaluators
INSERT INTO EVALUATOR (Name, Designation, Department, Email, Phone_Number, Experience_Years) VALUES
('Dr. Rajesh Kumar', 'Chief Engineer', 'Mechanical Engineering', 'rajesh.kumar@gov.in', '+91-9876543210', 25),
('Eng. Priya Sharma', 'Executive Engineer', 'Civil Engineering', 'priya.sharma@nhai.gov.in', '+91-9876543211', 18),
('Mr. Anish Gupta', 'General Manager', 'Electrical Engineering', 'anish.gupta@dmrc.org', '+91-9876543212', 20),
('Mrs. Sunita Rani', 'Deputy General Manager', 'Information Technology', 'sunita.rani@sbi.co.in', '+91-9876543213', 15),
('Dr. Vikram Singh', 'Senior Manager', 'Process Engineering', 'vikram.singh@ril.com', '+91-9876543214', 22),
('Mr. Arun Krishnan', 'Assistant General Manager', 'Quality Assurance', 'arun.krishnan@gov.in', '+91-9876543215', 12),
('Ms. Deepika Patel', 'Senior Engineer', 'Project Management', 'deepika.patel@nhai.gov.in', '+91-9876543216', 14),
('Dr. Suresh Nair', 'Chief Technology Officer', 'Systems Integration', 'suresh.nair@dmrc.org', '+91-9876543217', 28),
('Mr. Rahul Agarwal', 'Technology Head', 'Software Development', 'rahul.agarwal@sbi.co.in', '+91-9876543218', 16),
('Mrs. Kavita Joshi', 'Process Manager', 'Industrial Engineering', 'kavita.joshi@ril.com', '+91-9876543219', 19);

-- Insert Bidder Tender Participation
INSERT INTO BIDDER_TENDER_PARTICIPATION (Bidder_ID, Tender_ID, Registration_Date, Document_Purchase_Date, Pre_Qualification_Status) VALUES
(1, 1, '2024-01-16', '2024-01-17', 'Qualified'),
(2, 1, '2024-01-17', '2024-01-18', 'Qualified'),
(3, 2, '2024-01-21', '2024-01-22', 'Qualified'),
(1, 2, '2024-01-22', '2024-01-23', 'Qualified'),
(4, 3, '2024-02-02', '2024-02-03', 'Qualified'),
(2, 3, '2024-02-03', '2024-02-04', 'Qualified'),
(2, 4, '2024-02-11', '2024-02-12', 'Qualified'),
(3, 4, '2024-02-12', '2024-02-13', 'Qualified'),
(4, 4, '2024-02-13', '2024-02-14', 'Qualified'),
(1, 5, '2024-02-16', '2024-02-17', 'Qualified'),
(5, 5, '2024-02-17', '2024-02-18', 'Qualified');

-- Insert Bids
INSERT INTO BID (Bid_Amount, Submission_Date, Technical_Score, Financial_Score, Total_Score, Bid_Status, EMD_Submitted, Documents_Attached, Tender_ID, Bidder_ID) VALUES
(4850000000.00, '2024-02-14 16:30:00', 88.5, 92.3, 90.4, 'Under_Review', TRUE, TRUE, 1, 1),
(4920000000.00, '2024-02-14 15:45:00', 91.2, 89.7, 90.45, 'Under_Review', TRUE, TRUE, 1, 2),
(7650000000.00, '2024-02-28 16:00:00', 89.8, 94.2, 92.0, 'Under_Review', TRUE, TRUE, 2, 3),
(7850000000.00, '2024-02-28 14:30:00', 92.1, 91.5, 91.8, 'Under_Review', TRUE, TRUE, 2, 1),
(2420000000.00, '2024-03-14 16:15:00', 94.3, 87.9, 91.1, 'Submitted', TRUE, TRUE, 3, 4),
(2380000000.00, '2024-03-14 15:20:00', 89.7, 93.1, 91.4, 'Submitted', TRUE, TRUE, 3, 2),
(1450000000.00, '2024-03-19 16:45:00', 91.8, 88.5, 90.15, 'Submitted', TRUE, TRUE, 4, 2),
(1480000000.00, '2024-03-19 15:30:00', 88.9, 91.2, 90.05, 'Submitted', TRUE, TRUE, 4, 3),
(1520000000.00, '2024-03-19 14:15:00', 85.6, 87.3, 86.45, 'Submitted', TRUE, TRUE, 4, 4),
(3420000000.00, '2024-03-24 16:30:00', 92.4, 89.8, 91.1, 'Submitted', TRUE, TRUE, 5, 1),
(3380000000.00, '2024-03-24 15:45:00', 89.1, 92.7, 90.9, 'Submitted', TRUE, TRUE, 5, 5);

-- Insert Committee Evaluator Memberships
INSERT INTO COMMITTEE_EVALUATOR_MEMBERSHIP (Committee_ID, Evaluator_ID, Role, Joining_Date, Status) VALUES
(1, 1, 'Chairman', '2024-01-10', 'Active'),
(1, 6, 'Member', '2024-01-10', 'Active'),
(1, 10, 'Member', '2024-01-10', 'Active'),
(2, 2, 'Chairman', '2024-01-15', 'Active'),
(2, 7, 'Member', '2024-01-15', 'Active'),
(3, 3, 'Chairman', '2024-01-25', 'Active'),
(3, 8, 'Member', '2024-01-25', 'Active'),
(4, 4, 'Chairman', '2024-02-05', 'Active'),
(4, 9, 'Member', '2024-02-05', 'Active'),
(5, 5, 'Chairman', '2024-02-10', 'Active'),
(5, 10, 'Member', '2024-02-10', 'Active');

-- Insert Tender Committee Evaluations
INSERT INTO TENDER_COMMITTEE_EVALUATION (Tender_ID, Committee_ID, Evaluation_Start_Date, Evaluation_End_Date, Evaluation_Status, Final_Recommendation) VALUES
(1, 1, '2024-02-17', '2024-02-25', 'Completed', 'Both bids are technically sound. TCS bid offers better financial terms.'),
(2, 2, '2024-03-03', '2024-03-10', 'Completed', 'Infosys bid demonstrates superior technical capability and competitive pricing.'),
(3, 3, '2024-03-17', NULL, 'In_Progress', NULL),
(4, 4, '2024-03-22', NULL, 'In_Progress', NULL),
(5, 5, '2024-03-27', NULL, 'Not_Started', NULL);

-- Insert Evaluator Bid Reviews
INSERT INTO EVALUATOR_BID_REVIEW (Evaluator_ID, Bid_ID, Review_Date, Technical_Marks, Financial_Marks, Comments, Review_Status) VALUES
(1, 1, '2024-02-18', 88.5, 92.3, 'Good technical proposal with competitive pricing', 'Completed'),
(1, 2, '2024-02-19', 91.2, 89.7, 'Excellent technical specifications, slightly higher cost', 'Completed'),
(6, 1, '2024-02-20', 89.0, 91.8, 'Quality standards meet requirements', 'Completed'),
(6, 2, '2024-02-21', 90.8, 90.2, 'Comprehensive solution with good value proposition', 'Completed'),
(2, 3, '2024-03-04', 89.8, 94.2, 'Strong construction methodology and competitive bid', 'Completed'),
(2, 4, '2024-03-05', 92.1, 91.5, 'Proven track record but slightly higher cost', 'Completed'),
(7, 3, '2024-03-06', 90.2, 93.8, 'Excellent project management approach', 'Completed'),
(7, 4, '2024-03-07', 91.8, 92.1, 'Good technical proposal with reasonable pricing', 'Completed');

-- Insert Contracts (for awarded tenders)
INSERT INTO CONTRACT (Contract_Number, Award_Date, Contract_Value, Start_Date, Completion_Date, Performance_Guarantee, Contract_Status, Tender_ID, Bidder_ID) VALUES
('CNT/RLY/2024/001', '2024-02-26', 4920000000.00, '2024-03-15', '2025-03-14', 246000000.00, 'Active', 1, 2),
('CNT/NHAI/2024/002', '2024-03-11', 7650000000.00, '2024-04-01', '2026-03-31', 382500000.00, 'Active', 2, 3);

-- Insert Payments
INSERT INTO PAYMENT (Payment_Amount, Payment_Date, Payment_Type, Invoice_Number, Payment_Status, Contract_ID) VALUES
(492000000.00, '2024-03-20', 'Advance', 'INV/RLY/2024/001', 'Completed', 1),
(1230000000.00, '2024-06-15', 'Running', 'INV/RLY/2024/002', 'Completed', 1),
(765000000.00, '2024-04-05', 'Advance', 'INV/NHAI/2024/001', 'Completed', 2),
(1530000000.00, '2024-07-10', 'Running', 'INV/NHAI/2024/002', 'Completed', 2);

-- =====================================================
-- USEFUL VIEWS FOR REPORTING
-- =====================================================

-- View: Active Tenders with Organization Details
DROP VIEW IF EXISTS active_tenders_view;
CREATE VIEW active_tenders_view AS
SELECT 
    t.Tender_ID,
    t.Tender_Title,
    t.Tender_Type,
    t.Publication_Date,
    t.Submission_Deadline,
    t.Opening_Date,
    t.Estimated_Value,
    t.Status,
    o.Organization_Name,
    o.Organization_Type
FROM TENDER t
JOIN ORGANIZATION o ON t.Organization_ID = o.Organization_ID
WHERE t.Status = 'Open';

-- View: Bid Summary with Bidder Details
DROP VIEW IF EXISTS bid_summary_view;
CREATE VIEW bid_summary_view AS
SELECT 
    b.Bid_ID,
    t.Tender_Title,
    bd.Company_Name,
    b.Bid_Amount,
    b.Total_Score,
    b.Bid_Status,
    b.Submission_Date
FROM BID b
JOIN TENDER t ON b.Tender_ID = t.Tender_ID
JOIN BIDDER bd ON b.Bidder_ID = bd.Bidder_ID
ORDER BY t.Tender_ID, b.Total_Score DESC;

-- View: Contract Performance Summary
DROP VIEW IF EXISTS contract_performance_view;
CREATE VIEW contract_performance_view AS
SELECT 
    c.Contract_ID,
    c.Contract_Number,
    t.Tender_Title,
    bd.Company_Name,
    c.Contract_Value,
    c.Start_Date,
    c.Completion_Date,
    c.Contract_Status,
    COALESCE(SUM(p.Payment_Amount), 0) as Total_Payments,
    (c.Contract_Value - COALESCE(SUM(p.Payment_Amount), 0)) as Pending_Amount
FROM CONTRACT c
JOIN TENDER t ON c.Tender_ID = t.Tender_ID
JOIN BIDDER bd ON c.Bidder_ID = bd.Bidder_ID
LEFT JOIN PAYMENT p ON c.Contract_ID = p.Contract_ID AND p.Payment_Status = 'Completed'
GROUP BY c.Contract_ID;

-- View: Evaluation Progress
DROP VIEW IF EXISTS evaluation_progress_view;
CREATE VIEW evaluation_progress_view AS
SELECT 
    t.Tender_ID,
    t.Tender_Title,
    ec.Committee_Name,
    tce.Evaluation_Status,
    tce.Evaluation_Start_Date,
    tce.Evaluation_End_Date,
    COUNT(b.Bid_ID) as Total_Bids,
    COUNT(ebr.Review_ID) as Completed_Reviews
FROM TENDER t
JOIN TENDER_COMMITTEE_EVALUATION tce ON t.Tender_ID = tce.Tender_ID
JOIN EVALUATION_COMMITTEE ec ON tce.Committee_ID = ec.Committee_ID
LEFT JOIN BID b ON t.Tender_ID = b.Tender_ID
LEFT JOIN EVALUATOR_BID_REVIEW ebr ON b.Bid_ID = ebr.Bid_ID AND ebr.Review_Status = 'Completed'
GROUP BY t.Tender_ID, ec.Committee_ID;

-- =====================================================
-- USEFUL STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to get tender statistics
CREATE PROCEDURE GetTenderStatistics()
BEGIN
    SELECT 
        'Total Tenders' as Metric,
        COUNT(*) as Count
    FROM TENDER
    UNION ALL
    SELECT 
        'Open Tenders' as Metric,
        COUNT(*) as Count
    FROM TENDER 
    WHERE Status = 'Open'
    UNION ALL
    SELECT 
        'Awarded Tenders' as Metric,
        COUNT(*) as Count
    FROM TENDER 
    WHERE Status = 'Awarded'
    UNION ALL
    SELECT 
        'Total Bids' as Metric,
        COUNT(*) as Count
    FROM BID
    UNION ALL
    SELECT 
        'Active Contracts' as Metric,
        COUNT(*) as Count
    FROM CONTRACT 
    WHERE Contract_Status = 'Active';
END //

-- Procedure to get bidder performance
CREATE PROCEDURE GetBidderPerformance(IN bidder_id INT)
BEGIN
    SELECT 
        bd.Company_Name,
        COUNT(b.Bid_ID) as Total_Bids,
        COUNT(CASE WHEN b.Bid_Status = 'Accepted' THEN 1 END) as Won_Bids,
        AVG(b.Total_Score) as Average_Score,
        COUNT(c.Contract_ID) as Active_Contracts,
        COALESCE(SUM(c.Contract_Value), 0) as Total_Contract_Value
    FROM BIDDER bd
    LEFT JOIN BID b ON bd.Bidder_ID = b.Bidder_ID
    LEFT JOIN CONTRACT c ON bd.Bidder_ID = c.Bidder_ID AND c.Contract_Status = 'Active'
    WHERE bd.Bidder_ID = bidder_id
    GROUP BY bd.Bidder_ID;
END //

-- Procedure to update bid scores
CREATE PROCEDURE UpdateBidScores(IN bid_id INT)
BEGIN
    DECLARE avg_technical DECIMAL(5,2);
    DECLARE avg_financial DECIMAL(5,2);
    
    SELECT 
        AVG(Technical_Marks),
        AVG(Financial_Marks)
    INTO avg_technical, avg_financial
    FROM EVALUATOR_BID_REVIEW
    WHERE Bid_ID = bid_id AND Review_Status = 'Completed';
    
    UPDATE BID 
    SET 
        Technical_Score = COALESCE(avg_technical, 0),
        Financial_Score = COALESCE(avg_financial, 0),
        Total_Score = (COALESCE(avg_technical, 0) + COALESCE(avg_financial, 0)) / 2
    WHERE Bid_ID = bid_id;
END //

DELIMITER ;


-- =====================================================
-- AUTHENTICATION STORED PROCEDURES (ADDED)
-- These procedures implement registration and login in the database.
-- Password hashing uses SHA2(,256) here so logic and validation live in SQL as requested.
-- =====================================================

DROP PROCEDURE IF EXISTS sp_register_user;
DROP PROCEDURE IF EXISTS sp_login_user;
DROP PROCEDURE IF EXISTS sp_register_user;

-- Create USERS table if not present (used for authentication/roles)
CREATE TABLE IF NOT EXISTS USERS (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Role ENUM('admin','tender_manager','bidder','evaluator') NOT NULL DEFAULT 'bidder',
    Created_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed a default admin account if it doesn't exist (username: admin, password: admin123)
INSERT IGNORE INTO USERS (Username, Password_Hash, Role) VALUES ('admin', SHA2('admin123',256), 'admin');

DELIMITER //

-- Login User Procedure - Verifies credentials and returns user data
CREATE PROCEDURE sp_login_user(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_user_id INT DEFAULT NULL;
    DECLARE v_role VARCHAR(50) DEFAULT NULL;
    DECLARE v_password_hash VARCHAR(255) DEFAULT NULL;
    
    -- Get user data if username exists
    SELECT User_ID, Password_Hash, Role 
    INTO v_user_id, v_password_hash, v_role
    FROM USERS 
    WHERE Username = p_username
    LIMIT 1;
    
    -- Check if user exists and password matches
    IF v_user_id IS NULL THEN
        -- User not found
        SELECT NULL AS userId, NULL AS UserID, NULL AS Role, NULL AS username, 
               'Invalid username or password' AS error;
    ELSEIF v_password_hash != SHA2(p_password, 256) THEN
        -- Password doesn't match
        SELECT NULL AS userId, NULL AS UserID, NULL AS Role, NULL AS username, 
               'Invalid username or password' AS error;
    ELSE
        -- Successful login - return user data
        SELECT v_user_id AS userId, v_user_id AS UserID, v_role AS Role, 
               p_username AS username, 0 AS error_code, 'OK' AS error_message;
    END IF;
END //

-- Register User Procedure
CREATE PROCEDURE sp_register_user(
    IN p_username VARCHAR(100), 
    IN p_password VARCHAR(255), 
    IN p_role VARCHAR(50)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count FROM USERS WHERE Username = p_username;
    IF v_count > 0 THEN
        -- Return an error code and message for the application to display
        SELECT NULL AS userId, 1 AS error_code, 'User already exists' AS error_message;
    ELSE
        INSERT INTO USERS (Username, Password_Hash, Role) VALUES (p_username, SHA2(p_password,256), p_role);
        SELECT LAST_INSERT_ID() AS userId, 0 AS error_code, 'OK' AS error_message;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- ADDITIONAL PROCEDURES FOR FRONTEND FLOWS
-- These procedures centralize common actions so the Node/Express layer remains a thin proxy.
-- 1) sp_register_for_tender - registers a bidder for a tender (inserts into BIDDER_TENDER_PARTICIPATION)
-- 2) sp_submit_bid - submits a bid (inserts into BID), relies on triggers for deadline enforcement
-- 3) sp_award_tender - awards a tender by creating a CONTRACT row (trigger updates TENDER status)
-- =====================================================

DELIMITER //

CREATE PROCEDURE sp_register_for_tender(IN p_bidder_id INT, IN p_tender_id INT)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count FROM BIDDER_TENDER_PARTICIPATION WHERE Bidder_ID = p_bidder_id AND Tender_ID = p_tender_id;
    IF v_count > 0 THEN
        SELECT 1 AS error_code, 'Already registered for this tender' AS error_message;
    ELSE
        INSERT INTO BIDDER_TENDER_PARTICIPATION (Bidder_ID, Tender_ID, Registration_Date) VALUES (p_bidder_id, p_tender_id, CURDATE());
        SELECT 0 AS error_code, 'Registered' AS error_message;
    END IF;
END //

CREATE PROCEDURE sp_submit_bid(
    IN p_bidder_id INT,
    IN p_tender_id INT,
    IN p_bid_amount DECIMAL(15,2),
    IN p_emd_submitted BOOLEAN,
    IN p_documents_attached BOOLEAN
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_bid_id INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count FROM BIDDER_TENDER_PARTICIPATION WHERE Bidder_ID = p_bidder_id AND Tender_ID = p_tender_id;
    IF v_count = 0 THEN
        SELECT 1 AS error_code, 'Bidder not registered for this tender' AS error_message;
    ELSE
        INSERT INTO BID (Bid_Amount, Submission_Date, EMD_Submitted, Documents_Attached, Tender_ID, Bidder_ID)
        VALUES (p_bid_amount, NOW(), p_emd_submitted, p_documents_attached, p_tender_id, p_bidder_id);
        SET v_bid_id = LAST_INSERT_ID();
        SELECT 0 AS error_code, 'Bid submitted' AS error_message, v_bid_id AS Bid_ID;
    END IF;
END //

CREATE PROCEDURE sp_award_tender(IN p_tender_id INT, IN p_bid_id INT, IN p_awarded_by INT)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_bidder_id INT;
    DECLARE v_contract_num VARCHAR(100);
    DECLARE v_contract_value DECIMAL(15,2);

    SELECT COUNT(*) INTO v_exists FROM CONTRACT WHERE Tender_ID = p_tender_id;
    IF v_exists > 0 THEN
        SELECT 1 AS error_code, 'Tender already awarded' AS error_message;
    ELSE
        SELECT Bidder_ID, Bid_Amount INTO v_bidder_id, v_contract_value FROM BID WHERE Bid_ID = p_bid_id AND Tender_ID = p_tender_id;
        IF v_bidder_id IS NULL THEN
            SELECT 1 AS error_code, 'Bid not found for this tender' AS error_message;
        ELSE
            SET v_contract_num = CONCAT('CTR-', p_tender_id, '-', p_bid_id, '-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
            INSERT INTO CONTRACT (Contract_Number, Award_Date, Contract_Value, Start_Date, Completion_Date, Performance_Guarantee, Tender_ID, Bidder_ID)
            VALUES (v_contract_num, CURDATE(), v_contract_value, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 365 DAY), 0, p_tender_id, v_bidder_id);
            SELECT 0 AS error_code, 'Tender awarded' AS error_message, LAST_INSERT_ID() AS Contract_ID;
        END IF;
    END IF;
END //

DELIMITER ;


-- =====================================================
-- TRIGGERS FOR BUSINESS LOGIC
-- =====================================================

DELIMITER //

-- Trigger to update tender status when contract is awarded
DROP TRIGGER IF EXISTS update_tender_status_after_contract//
CREATE TRIGGER update_tender_status_after_contract
AFTER INSERT ON CONTRACT
FOR EACH ROW
BEGIN
    UPDATE TENDER 
    SET Status = 'Awarded' 
    WHERE Tender_ID = NEW.Tender_ID;
END //

-- Trigger to update bid scores when review is completed
DROP TRIGGER IF EXISTS update_bid_scores_after_review//
CREATE TRIGGER update_bid_scores_after_review
AFTER UPDATE ON EVALUATOR_BID_REVIEW
FOR EACH ROW
BEGIN
    IF NEW.Review_Status = 'Completed' AND OLD.Review_Status != 'Completed' THEN
        CALL UpdateBidScores(NEW.Bid_ID);
    END IF;
END //

-- Trigger to validate bid submission deadline
DROP TRIGGER IF EXISTS validate_bid_submission_time//
CREATE TRIGGER validate_bid_submission_time
BEFORE INSERT ON BID
FOR EACH ROW
BEGIN
    DECLARE deadline DATETIME;
    SELECT Submission_Deadline INTO deadline 
    FROM TENDER 
    WHERE Tender_ID = NEW.Tender_ID;
    
    IF NEW.Submission_Date > deadline THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Bid submission after deadline is not allowed';
    END IF;
END //

DELIMITER ;

DELIMITER //

-- 1) Get full payment history with contract & bidder information
CREATE PROCEDURE GetPaymentHistory()
BEGIN
    SELECT 
        c.Contract_Number,
        bd.Company_Name,
        p.Payment_Amount,
        p.Payment_Date,
        p.Payment_Type,
        p.Payment_Status
    FROM PAYMENT p
    JOIN CONTRACT c ON p.Contract_ID = c.Contract_ID
    JOIN BIDDER bd ON c.Bidder_ID = bd.Bidder_ID
    ORDER BY p.Payment_Date DESC;
END //

-- 2) Get highest scoring bids per tender
CREATE PROCEDURE GetHighestScoringBids()
BEGIN
    SELECT 
        t.Tender_Title,
        bd.Company_Name,
        b.Bid_Amount,
        b.Total_Score
    FROM BID b
    JOIN TENDER t ON b.Tender_ID = t.Tender_ID
    JOIN BIDDER bd ON b.Bidder_ID = bd.Bidder_ID
    WHERE b.Total_Score = (
        SELECT MAX(b2.Total_Score) 
        FROM BID b2 
        WHERE b2.Tender_ID = b.Tender_ID
    )
    ORDER BY t.Tender_ID;
END //

DELIMITER ;


-- =====================================================
-- EVALUATOR & ADMIN STORED PROCEDURES
-- Procedures to support evaluator review submission and admin CRUD
-- All business rules and validation remain in the DB.
-- =====================================================

DELIMITER //

-- Submit or update a review (marks as Completed when scores are provided)
CREATE PROCEDURE sp_submit_review(
    IN p_review_id INT,
    IN p_technical_marks DECIMAL(5,2),
    IN p_financial_marks DECIMAL(5,2),
    IN p_comments TEXT,
    IN p_evaluator_id INT
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists FROM EVALUATOR_BID_REVIEW WHERE Review_ID = p_review_id AND Evaluator_ID = p_evaluator_id;
    IF v_exists = 0 THEN
        SELECT 1 AS error_code, 'Review not found or not assigned to evaluator' AS error_message;
    ELSE
        UPDATE EVALUATOR_BID_REVIEW
        SET Technical_Marks = p_technical_marks,
            Financial_Marks = p_financial_marks,
            Comments = p_comments,
            Review_Status = 'Completed',
            Review_Date = NOW()
        WHERE Review_ID = p_review_id;
        -- the AFTER UPDATE trigger will call UpdateBidScores when Review_Status becomes Completed
        SELECT 0 AS error_code, 'Review submitted' AS error_message;
    END IF;
END //

-- Admin: create user (returns error_message on duplicate)
CREATE PROCEDURE sp_create_user(IN p_username VARCHAR(100), IN p_password VARCHAR(255), IN p_role VARCHAR(50))
BEGIN
    DECLARE v_count INT DEFAULT 0;
    SELECT COUNT(*) INTO v_count FROM USERS WHERE Username = p_username;
    IF v_count > 0 THEN
        SELECT 1 AS error_code, 'User already exists' AS error_message;
    ELSE
        INSERT INTO USERS (Username, Password_Hash, Role) VALUES (p_username, SHA2(p_password,256), p_role);
        SELECT 0 AS error_code, 'User created' AS error_message, LAST_INSERT_ID() AS User_ID;
    END IF;
END //

CREATE PROCEDURE sp_list_users()
BEGIN
    SELECT User_ID, Username, Role, Created_Date FROM USERS ORDER BY User_ID DESC;
END //

CREATE PROCEDURE sp_update_user(IN p_user_id INT, IN p_role VARCHAR(50))
BEGIN
    UPDATE USERS SET Role = p_role WHERE User_ID = p_user_id;
    SELECT 0 AS error_code, 'User updated' AS error_message;
END //

CREATE PROCEDURE sp_delete_user(IN p_user_id INT)
BEGIN
    DELETE FROM USERS WHERE User_ID = p_user_id;
    SELECT 0 AS error_code, 'User deleted' AS error_message;
END //

-- Organization CRUD (minimal)
CREATE PROCEDURE sp_create_organization(IN p_name VARCHAR(255), IN p_address TEXT, IN p_phone VARCHAR(50), IN p_email VARCHAR(100), IN p_reg_number VARCHAR(50), IN p_type VARCHAR(50))
BEGIN
    INSERT INTO ORGANIZATION (Organization_Name, Address, Phone_Number, Email, Registration_Number, Organization_Type)
    VALUES (p_name, p_address, p_phone, p_email, p_reg_number, p_type);
    SELECT 0 AS error_code, 'Organization created' AS error_message, LAST_INSERT_ID() AS Organization_ID;
END //

CREATE PROCEDURE sp_list_organizations()
BEGIN
    SELECT Organization_ID, Organization_Name, Email, Phone_Number, Registration_Number, Organization_Type FROM ORGANIZATION ORDER BY Organization_ID DESC;
END //

CREATE PROCEDURE sp_update_organization(IN p_org_id INT, IN p_name VARCHAR(255), IN p_address TEXT, IN p_phone VARCHAR(50), IN p_email VARCHAR(100))
BEGIN
    UPDATE ORGANIZATION SET Organization_Name = p_name, Address = p_address, Phone_Number = p_phone, Email = p_email WHERE Organization_ID = p_org_id;
    SELECT 0 AS error_code, 'Organization updated' AS error_message;
END //

CREATE PROCEDURE sp_delete_organization(IN p_org_id INT)
BEGIN
    DELETE FROM ORGANIZATION WHERE Organization_ID = p_org_id;
    SELECT 0 AS error_code, 'Organization deleted' AS error_message;
END //

DELIMITER ;



