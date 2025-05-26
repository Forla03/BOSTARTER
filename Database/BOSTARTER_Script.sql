-- Elimina il database BOSTARTER_DB se esiste
DROP DATABASE IF EXISTS BOSTARTER_DB;

-- Crea il database BOSTARTER_DB se non esiste
CREATE DATABASE IF NOT EXISTS BOSTARTER_DB;

-- Seleziona il database BOSTARTER_DB
USE BOSTARTER_DB;

-- Attiva l'event scheduler globale (utile per eventuali eventi automatici)
SET GLOBAL event_scheduler = ON;

-- Crea la tabella Utente: contiene le informazioni principali degli utenti
CREATE TABLE IF NOT EXISTS Utente (
    email VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    anno_nascita INT NOT NULL,
    luogo_nascita VARCHAR(100) NOT NULL
);

-- Crea la tabella CurriculumSkill: definisce le skill disponibili e i relativi livelli
CREATE TABLE IF NOT EXISTS CurriculumSkill (
    nome_skill VARCHAR(100),
    livello INT CHECK (livello BETWEEN 0 AND 5),
    PRIMARY KEY (nome_skill, livello)
);

-- Crea la tabella Possedimento: associa gli utenti alle skill che possiedono
CREATE TABLE IF NOT EXISTS Possedimento (
    emailUtente VARCHAR(255),
    skill VARCHAR(100),
    livello_skill INT,
    PRIMARY KEY (emailUtente, skill, livello_skill),
    FOREIGN KEY (emailUtente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (skill, livello_skill) REFERENCES CurriculumSkill(nome_skill, livello) ON DELETE CASCADE
);

-- Crea la tabella Amministratore: identifica gli utenti amministratori tramite un codice di sicurezza
CREATE TABLE IF NOT EXISTS Amministratore (
    email_utente VARCHAR(255) PRIMARY KEY,
    codice_sicurezza CHAR(5) NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE
);

-- Crea la tabella Creatore: identifica gli utenti creatori di progetti con un indice di affidabilità
CREATE TABLE IF NOT EXISTS Creatore (
    email_utente VARCHAR(255) PRIMARY KEY,
    affidabilita INT DEFAULT 0 CHECK (affidabilita >= 0),
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE
);

-- Crea la tabella Progetto: rappresenta un progetto creato da un utente
CREATE TABLE IF NOT EXISTS Progetto (
    nome VARCHAR(255) PRIMARY KEY,
    descrizione TEXT NOT NULL,
    data_inserimento DATE NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    data_limite DATE NOT NULL,
    stato ENUM('aperto', 'chiuso') NOT NULL DEFAULT 'aperto',
    email_creatore VARCHAR(255) NOT NULL,
    CHECK(data_limite > data_inserimento),
    FOREIGN KEY (email_creatore) REFERENCES Creatore(email_utente) ON DELETE CASCADE
);

-- Crea la tabella FotoProgetto: associa foto ai progetti
CREATE TABLE IF NOT EXISTS FotoProgetto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    foto LONGBLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

-- Crea la tabella Reward: definisce le ricompense offerte per ogni progetto
CREATE TABLE IF NOT EXISTS Reward (
    codice INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    descrizione TEXT NOT NULL,
    foto LONGBLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

-- Crea la tabella Finanziamento: registra le donazioni fatte dagli utenti ai progetti
CREATE TABLE IF NOT EXISTS Finanziamento (
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    importo DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    codice_reward INT NOT NULL,
    PRIMARY KEY (email_utente, nome_progetto, data),
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE,
    FOREIGN KEY (codice_reward) REFERENCES Reward(codice) ON DELETE CASCADE
);

-- Crea la tabella Commento: permette agli utenti di commentare sui progetti
CREATE TABLE IF NOT EXISTS Commento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

-- Crea la tabella RispostaCommento: permette ai creatori di rispondere ai commenti ricevuti
CREATE TABLE IF NOT EXISTS RispostaCommento (
    id_commento INT PRIMARY KEY,
    email_creatore VARCHAR(255) NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (id_commento) REFERENCES Commento(id) ON DELETE CASCADE,
    FOREIGN KEY (email_creatore) REFERENCES Creatore(email_utente) ON DELETE CASCADE
);

-- Crea la tabella ProgettoHardware: identifica i progetti di tipo hardware
CREATE TABLE IF NOT EXISTS ProgettoHardware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

-- Crea la tabella ProgettoComponente: definisce i componenti richiesti per un progetto hardware
CREATE TABLE IF NOT EXISTS ProgettoComponente (
    nome_progetto VARCHAR(255),
    nome_componente VARCHAR(100),
    quantita INT NOT NULL CHECK (quantita > 0),
    descrizione TEXT NOT NULL,
    prezzo INT NOT NULL,
    PRIMARY KEY (nome_progetto, nome_componente),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoHardware(nome_progetto) ON DELETE CASCADE
);

-- Crea la tabella ProgettoSoftware: identifica i progetti di tipo software
CREATE TABLE IF NOT EXISTS ProgettoSoftware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

-- Crea la tabella ProgettoProfilo: definisce i profili richiesti in un progetto software
CREATE TABLE IF NOT EXISTS ProgettoProfilo (
    nome_progetto VARCHAR(255) NOT NULL,
    nome_profilo VARCHAR(100) NOT NULL,
    PRIMARY KEY (nome_progetto, nome_profilo),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto) ON DELETE CASCADE
);

-- Crea la tabella SkillsProfilo: associa le skill necessarie a ciascun profilo richiesto
CREATE TABLE IF NOT EXISTS SkillsProfilo (
    nome_profilo VARCHAR(100) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    nome_skill VARCHAR(100),
    livello INT,
    PRIMARY KEY (nome_profilo, nome_progetto, nome_skill, livello),
    FOREIGN KEY (nome_progetto, nome_profilo) REFERENCES ProgettoProfilo(nome_progetto, nome_profilo),
    FOREIGN KEY (nome_skill, livello) REFERENCES CurriculumSkill(nome_skill, livello)
);

-- Crea la tabella Candidatura: registra le candidature degli utenti ai profili dei progetti software
CREATE TABLE IF NOT EXISTS Candidatura (
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    nome_profilo VARCHAR(100) NOT NULL,
    accettata BOOLEAN DEFAULT NULL,
    PRIMARY KEY (email_utente, nome_progetto, nome_profilo),
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto, nome_profilo) REFERENCES ProgettoProfilo(nome_progetto, nome_profilo)
);


-- Elimina l'eventuale evento esistente
DROP EVENT IF EXISTS ChiudiProgettiScaduti;

-- Crea un evento che ogni giorno chiude i progetti scaduti
CREATE EVENT IF NOT EXISTS ChiudiProgettiScaduti
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE Progetto
    SET stato = 'chiuso'
    WHERE data_limite < CURDATE() AND stato = 'aperto';

-- Elimina eventuali trigger esistenti
DROP TRIGGER IF EXISTS AggiornaStatoProgetto;
DROP TRIGGER IF EXISTS AggiornaAffidabilitaDopoCreazioneProgetto;
DROP TRIGGER IF EXISTS AggiornaAffidabilitaDopoFinanziamento;

-- Elimina eventuali procedure esistenti
DROP PROCEDURE IF EXISTS AggiungiProgettoHardware;
DROP PROCEDURE IF EXISTS AggiungiProgettoSoftware;
DROP PROCEDURE IF EXISTS FinanziaProgetto;
DROP PROCEDURE IF EXISTS VisualizzaProgettiDisponibili;
DROP PROCEDURE IF EXISTS ScegliReward;
DROP PROCEDURE IF EXISTS InserisciCommento;
DROP PROCEDURE IF EXISTS InviaCandidatura;
DROP PROCEDURE IF EXISTS DiventaCreatore;
DROP PROCEDURE IF EXISTS RifiutaRichiestaCreatore;
DROP PROCEDURE IF EXISTS AggiungiAmministratore;
DROP PROCEDURE IF EXISTS AccettaCandidatura;
DROP PROCEDURE IF EXISTS InserisciRispostaCommento;
DROP PROCEDURE IF EXISTS GetSoftwareProjects;
DROP PROCEDURE IF EXISTS GetHardwareProjects;
DROP PROCEDURE IF EXISTS GetUserRewards;
DROP PROCEDURE IF EXISTS GetUserApplications;
DROP PROCEDURE IF EXISTS RifiutaCandidatura;

-- Elimina eventuali viste esistenti
DROP VIEW IF EXISTS View_user_features;
DROP VIEW IF EXISTS View_general_project;
DROP VIEW IF EXISTS View_top_creators;
DROP VIEW IF EXISTS View_progetti_vicini_completamento;
DROP VIEW IF EXISTS View_top_funders;
DROP VIEW IF EXISTS View_closed_projects;

-- Imposta il delimitatore per consentire la creazione di blocchi complessi
DELIMITER $$

-- Crea il trigger per aggiornare automaticamente lo stato di un progetto
CREATE TRIGGER AggiornaStatoProgetto
AFTER INSERT ON Finanziamento
FOR EACH ROW
BEGIN
    DECLARE totale DECIMAL(10,2);
    DECLARE current_budget DECIMAL(10,2);
    
    -- Preleva il budget del progetto, bloccando la riga per aggiornamenti sicuri
    SELECT budget INTO current_budget
    FROM Progetto
    WHERE nome = NEW.nome_progetto
    FOR UPDATE;

    -- Calcola la somma totale dei finanziamenti ricevuti
    SELECT SUM(importo) INTO totale
    FROM Finanziamento
    WHERE nome_progetto = NEW.nome_progetto;

    -- Se il totale dei finanziamenti raggiunge o supera il budget, chiude il progetto
    IF totale >= current_budget THEN
        UPDATE Progetto
        SET stato = 'chiuso'
        WHERE nome = NEW.nome_progetto;
    END IF;
END $$

DELIMITER ;

-- Crea il trigger per aggiornare l'affidabilità del creatore dopo la creazione di un progetto
DELIMITER $$
CREATE TRIGGER AggiornaAffidabilitaDopoCreazioneProgetto
AFTER INSERT ON Progetto
FOR EACH ROW
BEGIN
    DECLARE numeratore INT DEFAULT 0;
    DECLARE denominatore INT DEFAULT 0;

    -- Preleva (e blocca) l'affidabilità corrente del creatore
    SELECT affidabilita
    INTO @dummy
    FROM Creatore
    WHERE email_utente = NEW.email_creatore
    FOR UPDATE;

    -- Conta i progetti del creatore che hanno ricevuto almeno un finanziamento
    SELECT COUNT(DISTINCT P.nome)
    INTO numeratore
    FROM Progetto P
    JOIN Finanziamento F ON P.nome = F.nome_progetto
    WHERE P.email_creatore = NEW.email_creatore;

    -- Conta il numero totale di progetti creati
    SELECT COUNT(*)
    INTO denominatore
    FROM Progetto
    WHERE email_creatore = NEW.email_creatore;

    -- Aggiorna l'affidabilità come percentuale di progetti finanziati
    UPDATE Creatore
    SET affidabilita = IF(denominatore = 0, 0, ROUND((numeratore / denominatore) * 100))
    WHERE email_utente = NEW.email_creatore;
END $$
DELIMITER ;

-- Crea il trigger per aggiornare l'affidabilità del creatore dopo un nuovo finanziamento
DELIMITER $$
CREATE TRIGGER AggiornaAffidabilitaDopoFinanziamento
AFTER INSERT ON Finanziamento
FOR EACH ROW
BEGIN
    DECLARE email_creatore VARCHAR(255);
    DECLARE numeratore INT DEFAULT 0;
    DECLARE denominatore INT DEFAULT 0;
    DECLARE dummy_affidabilita INT;

    -- Trova l'email del creatore del progetto finanziato
    SELECT P.email_creatore INTO email_creatore
    FROM Progetto P
    WHERE P.nome = NEW.nome_progetto;

    -- Preleva (e blocca) l'affidabilità attuale del creatore
    SELECT affidabilita INTO dummy_affidabilita
    FROM Creatore
    WHERE email_utente = email_creatore
    FOR UPDATE;

    -- Conta quanti progetti del creatore hanno almeno un finanziamento
    SELECT COUNT(DISTINCT P.nome)
    INTO numeratore
    FROM Progetto P
    WHERE P.email_creatore = email_creatore
    AND EXISTS (
        SELECT 1 FROM Finanziamento F WHERE F.nome_progetto = P.nome
    );

    -- Conta il numero totale di progetti del creatore
    SELECT COUNT(*)
    INTO denominatore
    FROM Progetto
    WHERE email_creatore = email_creatore;

    -- Aggiorna l'affidabilità come percentuale di progetti finanziati
    UPDATE Creatore
    SET affidabilita = IF(denominatore = 0, 0, ROUND((numeratore / denominatore) * 100))
    WHERE email_utente = email_creatore;
END $$
DELIMITER ;

-- Procedura per ottenere tutti i progetti software di un utente
DELIMITER $$
CREATE PROCEDURE GetSoftwareProjects(
    IN p_email_utente VARCHAR(255)
)
BEGIN
    SELECT 
        P.nome AS NomeProgetto,
        P.descrizione AS Descrizione,
        P.budget AS Budget,
        P.data_inserimento AS DataInserimento,
        P.data_limite AS DataLimite
    FROM Progetto P
    JOIN ProgettoSoftware PS ON P.nome = PS.nome_progetto
    WHERE P.email_creatore = p_email_utente;
END $$
DELIMITER ;

-- Procedura per ottenere tutti i progetti hardware di un utente
DELIMITER $$
CREATE PROCEDURE GetHardwareProjects(
    IN p_email_utente VARCHAR(255)
)
BEGIN
    SELECT 
        P.nome AS NomeProgetto,
        P.descrizione AS Descrizione,
        P.budget AS Budget,
        P.data_inserimento AS DataInserimento,
        P.data_limite AS DataLimite
    FROM Progetto P
    JOIN ProgettoHardware PH ON P.nome = PH.nome_progetto
    WHERE P.email_creatore = p_email_utente;
END $$
DELIMITER ;

-- Procedura per ottenere tutti i reward collegati ai finanziamenti di un utente
DELIMITER $$
CREATE PROCEDURE GetUserRewards(
    IN p_email_utente VARCHAR(255)
)
BEGIN
    SELECT 
        R.codice AS CodiceReward,
        R.descrizione AS DescrizioneReward,
        R.nome_progetto AS NomeProgetto,
        R.foto AS FotoReward,
        P.descrizione AS DescrizioneProgetto,
        F.importo AS ImportoFinanziato,
        F.data AS DataFinanziamento
    FROM Finanziamento F
    JOIN Reward R ON F.codice_reward = R.codice
    JOIN Progetto P ON R.nome_progetto = P.nome
    WHERE F.email_utente = p_email_utente;
END $$
DELIMITER ;

-- Procedura per ottenere tutte le candidature accettate di un utente
DELIMITER $$
CREATE PROCEDURE GetUserApplications(
    IN p_email_utente VARCHAR(255)
)
BEGIN
    SELECT 
        C.nome_progetto AS NomeProgetto,
        C.nome_profilo AS NomeProfilo
    FROM Candidatura C
    WHERE C.email_utente = p_email_utente
      AND C.accettata = 1;
END $$
DELIMITER ;

-- Procedura per aggiungere un progetto hardware
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
    
    -- Inserisce il progetto nella tabella specifica ProgettoHardware
    INSERT INTO ProgettoHardware (nome_progetto)
    VALUES (p_nome);
END $$

-- Procedura per aggiungere un progetto software
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
    
    -- Inserisce il progetto nella tabella specifica ProgettoSoftware
    INSERT INTO ProgettoSoftware (nome_progetto)
    VALUES (p_nome);
END $$
DELIMITER ;

-- Procedura per finanziare un progetto
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
        -- Se il progetto è chiuso, genera un errore
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il progetto è chiuso e non può essere finanziato.';
    END IF;
END $$
DELIMITER ;


-- Procedura per visualizzare tutti i progetti con stato "aperto"
DELIMITER $$

CREATE PROCEDURE VisualizzaProgettiDisponibili()
BEGIN
    SELECT * FROM Progetto WHERE stato = 'aperto';
END $$

DELIMITER ;

-- Procedura per assegnare una reward a un utente su un progetto se valida
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
        -- Errore se la reward non è valida
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Reward non valida per questo progetto.';
    END IF;
END $$

DELIMITER ;

-- Procedura per inserire un nuovo commento a un progetto
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

-- Procedura per inserire una risposta a un commento da parte di un creatore
DELIMITER $$

CREATE PROCEDURE InserisciRispostaCommento(
    IN p_id_commento INT,
    IN p_email_creatore VARCHAR(255),
    IN p_testo TEXT
)
BEGIN
    -- Controlla se il commento esiste
    IF EXISTS (SELECT 1 FROM Commento WHERE id = p_id_commento) THEN
        -- Controlla se chi risponde è un creatore
        IF EXISTS (SELECT 1 FROM Creatore WHERE email_utente = p_email_creatore) THEN
            -- Inserisce la risposta
            INSERT INTO RispostaCommento (id_commento, email_creatore, testo)
            VALUES (p_id_commento, p_email_creatore, p_testo);
        ELSE
            -- Errore se l'email non è di un creatore
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Email fornita non appartiene a un creatore.';
        END IF;
    ELSE
        -- Errore se il commento non esiste
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il commento specificato non esiste.';
    END IF;
END $$

DELIMITER ;

-- Procedura per inviare una candidatura a un profilo di progetto
DELIMITER $$

CREATE PROCEDURE InviaCandidatura(
    IN email_utente VARCHAR(255),
    IN nome_progetto_input VARCHAR(255),
    IN nome_profilo_input VARCHAR(255)
)
BEGIN
    DECLARE candidatura_esistente INT;
    DECLARE ha_skill_necessarie INT;

    -- Verifica se esiste già una candidatura
    SELECT COUNT(*) INTO candidatura_esistente
    FROM Candidatura
    WHERE email_utente = email_utente 
      AND nome_progetto = nome_progetto_input 
      AND nome_profilo = nome_profilo_input;

    IF candidatura_esistente > 0 THEN
        -- Errore: candidatura già inviata
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'TI_SEI_GIA_CANDIDATO';
    END IF;

    -- Verifica se l'utente possiede tutte le skill richieste
    SELECT COUNT(*) INTO ha_skill_necessarie
    FROM SkillsProfilo sp
    LEFT JOIN Possedimento p 
        ON sp.nome_skill = p.skill 
        AND p.emailUtente = email_utente  
        AND sp.livello <= p.livello_skill
    WHERE sp.nome_progetto = nome_progetto_input 
      AND sp.nome_profilo = nome_profilo_input
      AND p.emailUtente IS NULL;

    IF ha_skill_necessarie > 0 THEN
        -- Errore: skill mancanti
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SKILL_NON_SODDISFATTE';
    END IF;

    -- Inserisce la candidatura
    INSERT INTO Candidatura(email_utente, nome_progetto, nome_profilo)
    VALUES (email_utente, nome_progetto_input, nome_profilo_input);
END $$

DELIMITER ;

-- Procedura per accettare una candidatura da parte del creatore del progetto
DELIMITER $$

CREATE PROCEDURE AccettaCandidatura(
    IN p_email_candidato VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_nome_profilo VARCHAR(100),
    IN p_email_corrente VARCHAR(255)
)
BEGIN
    DECLARE creatore_progetto VARCHAR(255);
    DECLARE candidatura_esistente INT;
    DECLARE già_accettata BOOLEAN;

    -- Recupera il creatore del progetto
    SELECT email_creatore INTO creatore_progetto
    FROM Progetto 
    WHERE Progetto.nome = p_nome_progetto;

    IF creatore_progetto IS NULL THEN
        -- Errore: progetto non trovato
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Progetto non trovato.';
    ELSEIF creatore_progetto != p_email_corrente THEN
        -- Errore: utente non autorizzato
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Non autorizzato.';
    ELSE
        -- Controlla se esiste la candidatura
        SELECT COUNT(*) INTO candidatura_esistente
        FROM Candidatura
        WHERE email_utente = p_email_candidato
          AND nome_progetto = p_nome_progetto
          AND nome_profilo = p_nome_profilo;

        -- Controlla se è già accettata
        SELECT accettata INTO già_accettata
        FROM Candidatura
        WHERE email_utente = p_email_candidato
          AND nome_progetto = p_nome_progetto
          AND nome_profilo = p_nome_profilo
        LIMIT 1;

        IF candidatura_esistente = 0 THEN
            -- Errore: candidatura non trovata
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Candidatura non trovata.';
        ELSEIF già_accettata THEN
            -- Errore: candidatura già accettata
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Candidatura già accettata.';
        ELSE
            -- Accetta la candidatura
            UPDATE Candidatura
            SET accettata = TRUE
            WHERE email_utente = p_email_candidato
              AND nome_progetto = p_nome_progetto
              AND nome_profilo = p_nome_profilo;
        END IF;
    END IF;
END $$

DELIMITER ;

-- Procedura per rifiutare una candidatura:
-- Controlla che il progetto esista e che il richiedente sia il creatore del progetto.
-- Se la candidatura esiste, la imposta come rifiutata (accettata = FALSE).
DELIMITER $$

CREATE PROCEDURE RifiutaCandidatura(
    IN p_email_candidato VARCHAR(255),
    IN p_nome_progetto VARCHAR(255),
    IN p_nome_profilo VARCHAR(100),
    IN p_email_corrente VARCHAR(255)
)
BEGIN
    DECLARE creatore_progetto VARCHAR(255);
    DECLARE candidatura_esistente INT;

    -- Recupera il creatore del progetto
    SELECT email_creatore INTO creatore_progetto
    FROM Progetto
    WHERE nome = p_nome_progetto;

    IF creatore_progetto IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Progetto non trovato.';
    ELSEIF creatore_progetto != p_email_corrente THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Non autorizzato.';
    ELSE
        -- Controlla se la candidatura esiste
        SELECT COUNT(*) INTO candidatura_esistente
        FROM Candidatura
        WHERE email_utente = p_email_candidato
          AND nome_progetto = p_nome_progetto
          AND nome_profilo = p_nome_profilo;

        IF candidatura_esistente = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Candidatura non trovata.';
        ELSE
            -- Aggiorna la candidatura come rifiutata
            UPDATE Candidatura
            SET accettata = FALSE
            WHERE email_utente = p_email_candidato
              AND nome_progetto = p_nome_progetto
              AND nome_profilo = p_nome_profilo;
        END IF;
    END IF;
END $$

DELIMITER ;

-- Procedura per aggiungere un amministratore:
-- Controlla se l'utente esiste e se non è già amministratore.
-- Se i controlli passano, lo aggiunge alla tabella Amministratore.
DELIMITER $$

CREATE PROCEDURE AggiungiAmministratore(
    IN p_email VARCHAR(255),
    IN p_codice_sicurezza CHAR(5)
)
BEGIN
    -- Controlla se l'utente esiste
    IF EXISTS (SELECT 1 FROM Utente WHERE email = p_email) THEN
        -- Controlla se l'utente è già un amministratore
        IF NOT EXISTS (SELECT 1 FROM Amministratore WHERE email_utente = p_email) THEN
            -- Inserisce l'utente come amministratore
            INSERT INTO Amministratore (email_utente, codice_sicurezza)
            VALUES (p_email, p_codice_sicurezza);
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Utente è già un amministratore';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Utente non esiste';
    END IF;
END $$

DELIMITER ;

-- Vista che mostra informazioni di base sugli utenti:
-- Include dati anagrafici e competenze possedute (skill e livello).
CREATE VIEW View_user_features AS
SELECT 
    U.email,
    U.nickname,
    U.nome,
    U.cognome,
    U.anno_nascita,
    U.luogo_nascita,
    P.skill AS nome_skill,
    P.livello_skill
FROM Utente U
LEFT JOIN Possedimento P ON U.email = P.emailUtente;

-- Vista che riassume i progetti aperti:
-- Fornisce nome, descrizione, budget, somma dei finanziamenti ricevuti e tipo di progetto.
CREATE VIEW View_general_project AS
SELECT 
    P.nome AS NomeProgetto,
    P.descrizione AS Descrizione,
    P.budget AS Budget,
    COALESCE(SUM(F.importo), 0) AS TotaleFinanziato,
    CASE 
        WHEN EXISTS (SELECT 1 FROM ProgettoHardware PH WHERE PH.nome_progetto = P.nome) THEN 'Hardware'
        WHEN EXISTS (SELECT 1 FROM ProgettoSoftware PS WHERE PS.nome_progetto = P.nome) THEN 'Software'
        ELSE 'Altro'
    END AS TipoProgetto
FROM Progetto P
LEFT JOIN Finanziamento F ON P.nome = F.nome_progetto
WHERE P.stato = "aperto"
GROUP BY P.nome, P.descrizione, P.budget;

-- Vista che mostra i progetti chiusi:
-- Riporta nome, descrizione, data limite, tipo di progetto e se il budget è stato raggiunto.
CREATE VIEW View_closed_projects AS
SELECT 
    P.nome AS NomeProgetto,
    P.descrizione AS Descrizione,
    P.data_limite AS DataLimite,
    CASE 
        WHEN EXISTS (SELECT 1 FROM ProgettoHardware PH WHERE PH.nome_progetto = P.nome) THEN 'Hardware'
        WHEN EXISTS (SELECT 1 FROM ProgettoSoftware PS WHERE PS.nome_progetto = P.nome) THEN 'Software'
        ELSE 'Altro'
    END AS TipoProgetto,
    COALESCE(SUM(F.importo), 0) >= P.budget AS FinanziatoCompletamente
FROM Progetto P
LEFT JOIN Finanziamento F ON P.nome = F.nome_progetto
WHERE P.stato = 'chiuso'
GROUP BY P.nome, P.descrizione, P.data_limite, P.budget;

-- Vista che mostra i 3 creatori con maggiore affidabilità:
-- Ordina per affidabilità decrescente.
CREATE VIEW View_top_creators AS
SELECT 
    U.nickname,
    C.affidabilita
FROM Creatore C
JOIN Utente U ON C.email_utente = U.email
ORDER BY C.affidabilita DESC
LIMIT 3;

-- Vista che mostra i 3 progetti più vicini al completamento del budget:
-- Ordina i progetti aperti in base alla differenza tra budget e fondi ricevuti.
CREATE VIEW View_progetti_vicini_completamento AS
SELECT 
    P.nome AS NomeProgetto,
    P.descrizione AS Descrizione,
    P.budget AS Budget,
    COALESCE(SUM(F.importo), 0) AS TotaleFinanziato,
    (P.budget - COALESCE(SUM(F.importo), 0)) AS Differenza
FROM Progetto P
LEFT JOIN Finanziamento F ON P.nome = F.nome_progetto
WHERE P.stato = 'aperto'
GROUP BY P.nome, P.descrizione, P.budget
ORDER BY Differenza ASC
LIMIT 3;

-- Vista che mostra i 3 utenti che hanno finanziato di più:
-- Ordina per totale finanziato decrescente.
CREATE VIEW View_top_funders AS
SELECT 
    U.nickname,
    COALESCE(SUM(F.importo), 0) AS TotaleFinanziato
FROM Utente U
JOIN Finanziamento F ON U.email = F.email_utente
GROUP BY U.nickname
ORDER BY TotaleFinanziato DESC
LIMIT 3;
