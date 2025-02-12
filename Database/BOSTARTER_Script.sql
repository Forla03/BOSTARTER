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
    codice_sicurezza CHAR(5) NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);

CREATE TABLE Creatore (
    email_utente VARCHAR(255) PRIMARY KEY,
    nr_progetti INT DEFAULT 0,
    affidabilita INT CHECK (affidabilita >= 0),
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);

CREATE TABLE Creatore_enrollement(
    email_utente VARCHAR(255) PRIMARY KEY,
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

DELIMITER $$

CREATE PROCEDURE AggiungiProgettoHardware(
    IN p_nome VARCHAR(255),
    IN p_descrizione TEXT,
    IN p_data_inserimento DATE,
    IN p_budget FLOAT,
    IN p_data_limite DATE,
    IN p_email_creatore VARCHAR(255)
)
BEGIN
    -- Inserisce il progetto nella tabella Progetto
    INSERT INTO Progetto (nome, descrizione, data_inserimento, budget, data_limite, email_creatore)
    VALUES (p_nome, p_descrizione, p_data_inserimento, p_budget, p_data_limite, p_email_creatore);
    
    -- Inserisce il progetto nella tabella ProgettoHardware
    INSERT INTO ProgettoHardware (nome_progetto)
    VALUES (p_nome);
END $$

CREATE PROCEDURE AggiungiProgettoSoftware(
    IN p_nome VARCHAR(255),
    IN p_descrizione TEXT,
    IN p_data_inserimento DATE,
    IN p_budget FLOAT,
    IN p_data_limite DATE,
    IN p_email_creatore VARCHAR(255)
)
BEGIN
    -- Inserisce il progetto nella tabella Progetto
    INSERT INTO Progetto (nome, descrizione, data_inserimento, budget, data_limite, email_creatore)
    VALUES (p_nome, p_descrizione, p_data_inserimento, p_budget, p_data_limite, p_email_creatore);
    
    -- Inserisce il progetto nella tabella ProgettoSoftware
    INSERT INTO ProgettoSoftware (nome_progetto)
    VALUES (p_nome);
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE FinanziaProgetto(
    IN p_email_utente VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_importo FLOAT,
    IN p_data DATE,
    IN p_codice_reward INT
)
BEGIN
    DECLARE progetto_stato ENUM('aperto', 'chiuso');

    -- Controlla se il progetto è aperto
    SELECT stato INTO progetto_stato FROM Progetto WHERE nome = p_nome_progetto;

    IF progetto_stato = 'aperto' THEN
        -- Inserisce il finanziamento
        INSERT INTO Finanziamento (email_utente, nome_progetto, importo, data, codice_reward)
        VALUES (p_email_utente, p_nome_progetto, p_importo, p_data, p_codice_reward);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il progetto è chiuso e non può essere finanziato.';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE VisualizzaProgettiDisponibili()
BEGIN
    SELECT * FROM Progetto WHERE stato = 'aperto';
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE ScegliReward(
    IN p_email_utente VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_codice_reward INT
)
BEGIN
    DECLARE reward_esiste INT;

    -- Controlla se la reward esiste per il progetto
    SELECT COUNT(*) INTO reward_esiste
    FROM Reward
    WHERE codice = p_codice_reward AND nome_progetto = p_nome_progetto;

    IF reward_esiste > 0 THEN
        -- Assegna la reward
        UPDATE Finanziamento
        SET codice_reward = p_codice_reward
        WHERE email_utente = p_email_utente AND nome_progetto = p_nome_progetto;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Reward non valida per questo progetto.';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE InserisciCommento(
    IN p_email_utente VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_data DATE,
    IN p_testo TEXT
)
BEGIN
    INSERT INTO Commento (email_utente, nome_progetto, data, testo)
    VALUES (p_email_utente, p_nome_progetto, p_data, p_testo);
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE InviaCandidatura(
    IN p_email_utente VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_nome_profilo VARCHAR(100)
)
BEGIN
    DECLARE progetto_esiste INT;
    DECLARE profilo_esiste INT;

    -- Controlla se il progetto software esiste
    SELECT COUNT(*) INTO progetto_esiste
    FROM ProgettoSoftware
    WHERE nome_progetto = p_nome_progetto;

    -- Controlla se il profilo è richiesto per il progetto
    SELECT COUNT(*) INTO profilo_esiste
    FROM ProfiliElenco
    WHERE nome_progetto = p_nome_progetto AND nome_profilo = p_nome_profilo;

    IF progetto_esiste > 0 AND profilo_esiste > 0 THEN
        -- Inserisce la candidatura
        INSERT INTO Candidatura (email_utente, nome_progetto, nome_profilo)
        VALUES (p_email_utente, p_nome_progetto, p_nome_profilo);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il progetto o il profilo non esistono.';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

-- Procedura per accettare la richiesta e aggiungere l'utente a Creatore
CREATE PROCEDURE DiventaCreatore(IN email VARCHAR(255))
BEGIN
    -- Controllo se l'utente ha fatto richiesta
    IF EXISTS (SELECT 1 FROM Creatore_enrollement WHERE email_utente = email) THEN
        -- Inserisce l'utente nella tabella Creatore
        INSERT INTO Creatore (email, nr_progetti, affidabilita) VALUES (email, 0, 0);
        
        -- Rimuove la richiesta dalla tabella Creatore_enrollement
        DELETE FROM Creatore_enrollement WHERE email_utente = email;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nessuna richiesta trovata per questa email';
    END IF;
END$$

-- Procedura per rifiutare la richiesta di diventare creatore
CREATE PROCEDURE RifiutaRichiestaCreatore(IN email VARCHAR(255))
BEGIN
    -- Controllo se la richiesta esiste
    IF EXISTS (SELECT 1 FROM Creatore_enrollement WHERE email_utente = email) THEN
        -- Cancella la richiesta
        DELETE FROM Creatore_enrollement WHERE email_utente = email;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nessuna richiesta trovata per questa email';
    END IF;
END$$

DELIMITER ;