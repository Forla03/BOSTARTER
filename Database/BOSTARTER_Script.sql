DROP DATABASE IF EXISTS BOSTARTER_DB;
CREATE DATABASE IF NOT EXISTS BOSTARTER_DB;
USE BOSTARTER_DB;

CREATE TABLE Utente (
    email VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    anno_nascita INT NOT NULL,
    luogo_nascita VARCHAR(100) NOT NULL
);

CREATE TABLE CurriculumSkill (
    nome_skill VARCHAR(100),
    livello INT CHECK (livello BETWEEN 0 AND 5),
    PRIMARY KEY (nome_skill, livello)
);

CREATE TABLE Possedimento (
    emailUtente VARCHAR(100),
    skill VARCHAR(100),
    livello_skill INT,
    PRIMARY KEY (emailUtente, skill, livello_skill),
    FOREIGN KEY (emailUtente) REFERENCES Utente(email),
    FOREIGN KEY (skill, livello_skill) REFERENCES CurriculumSkill(nome_skill, livello)
);

CREATE TABLE Amministratore (
    email_utente VARCHAR(255) PRIMARY KEY,
    codice_sicurezza VARCHAR(50) NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);

CREATE TABLE Creatore (
    email_utente VARCHAR(255) PRIMARY KEY,
    nr_progetti INT DEFAULT 0,
    affidabilita INT CHECK (affidabilita >= 0),
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);

CREATE TABLE Progetto (
    nome VARCHAR(255) PRIMARY KEY,
    descrizione TEXT NOT NULL,
    data_inserimento DATE NOT NULL,
    budget FLOAT NOT NULL,
    data_limite DATE NOT NULL,
    stato ENUM('aperto', 'chiuso') NOT NULL DEFAULT 'aperto',
    email_creatore VARCHAR(255) NOT NULL,
    CHECK(data_limite > data_inserimento),
    FOREIGN KEY (email_creatore) REFERENCES Creatore(email_utente)
);

CREATE TABLE FotoProgetto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    foto BLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE Reward (
    codice INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    descrizione TEXT NOT NULL,
    foto BLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE Finanziamento (
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    importo FLOAT NOT NULL,
    data DATE NOT NULL,
    codice_reward INT NOT NULL UNIQUE,
    PRIMARY KEY (email_utente, nome_progetto, data),
    FOREIGN KEY (email_utente) REFERENCES Utente(email),
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome),
    FOREIGN KEY (codice_reward) REFERENCES Reward(codice)
);

CREATE TABLE Commento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email),
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome)
);

CREATE TABLE RispostaCommento (
    id_commento INT PRIMARY KEY,
    email_creatore VARCHAR(255) NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (id_commento) REFERENCES Commento(id) ON DELETE CASCADE,
    FOREIGN KEY (email_creatore) REFERENCES Creatore(email_utente) ON DELETE CASCADE
);

CREATE TABLE ProgettoHardware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE Componente (
    nome VARCHAR(100) PRIMARY KEY,
    descrizione TEXT NOT NULL,
    prezzo INT NOT NULL
);

CREATE TABLE ProgettoComponente (
    nome_progetto VARCHAR(255),
    nome_componente VARCHAR(100),
    quantita INT CHECK (quantita > 0) NOT NULL,
    PRIMARY KEY (nome_progetto, nome_componente),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoHardware(nome_progetto) ON DELETE CASCADE,
    FOREIGN KEY (nome_componente) REFERENCES Componente(nome)
);

CREATE TABLE ProgettoSoftware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE Profilo (
    nome VARCHAR(100) PRIMARY KEY
);

CREATE TABLE ProfiliElenco (
    nome_profilo VARCHAR(100),
    nome_progetto VARCHAR(255),
    PRIMARY KEY (nome_profilo, nome_progetto),
    FOREIGN KEY (nome_profilo) REFERENCES Profilo(nome),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto)
);

CREATE TABLE SkillsProfilo (
    nome_profilo VARCHAR(100),
    nome_skill VARCHAR(100),
    livello INT,
    PRIMARY KEY (nome_profilo, nome_skill, livello),
    FOREIGN KEY (nome_profilo) REFERENCES Profilo(nome),
    FOREIGN KEY (nome_skill, livello) REFERENCES CurriculumSkill(nome_skill, livello)
);

CREATE TABLE Candidatura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    nome_profilo VARCHAR(100) NOT NULL,
    accettata BOOLEAN DEFAULT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto) ON DELETE CASCADE,
    FOREIGN KEY (nome_profilo) REFERENCES Profilo(nome)
);

DELIMITER $$

CREATE TRIGGER AggiornaStatoProgetto
AFTER INSERT ON Finanziamento
FOR EACH ROW
BEGIN
    DECLARE totale DECIMAL(10,2);

    -- Calcola la somma totale dei finanziamenti per il progetto
    SELECT SUM(importo) INTO totale
    FROM Finanziamento
    WHERE nome_progetto = NEW.nome_progetto;

    -- Se il totale raggiunge o supera il budget, aggiorna lo stato del progettoamministratoreamministratore
    UPDATE Progetto
    SET stato = 'chiuso'
    WHERE nome = NEW.nome_progetto AND totale >= budget;
END $$

DELIMITER ;