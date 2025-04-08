CREATE DATABASE IF NOT EXISTS BOSTARTER_DB;
USE BOSTARTER_DB;
SET GLOBAL event_scheduler = ON;

CREATE TABLE IF NOT EXISTS Utente (
    email VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    anno_nascita INT NOT NULL,
    luogo_nascita VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS CurriculumSkill (
    nome_skill VARCHAR(100),
    livello INT CHECK (livello BETWEEN 0 AND 5),
    PRIMARY KEY (nome_skill, livello)
);

CREATE TABLE IF NOT EXISTS Possedimento (
    emailUtente VARCHAR(100),
    skill VARCHAR(100),
    livello_skill INT,
    PRIMARY KEY (emailUtente, skill, livello_skill),
    FOREIGN KEY (emailUtente) REFERENCES Utente(email),
    FOREIGN KEY (skill, livello_skill) REFERENCES CurriculumSkill(nome_skill, livello)
);

CREATE TABLE IF NOT EXISTS Amministratore (
    email_utente VARCHAR(255) PRIMARY KEY,
    codice_sicurezza CHAR(5) NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);

CREATE TABLE IF NOT EXISTS Creatore (
    email_utente VARCHAR(255) PRIMARY KEY,
    nr_progetti INT DEFAULT 0,
    affidabilita INT DEFAULT 0 CHECK (affidabilita >= 0),
    FOREIGN KEY (email_utente) REFERENCES Utente(email)
);


CREATE TABLE IF NOT EXISTS Progetto (
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

CREATE TABLE IF NOT EXISTS FotoProgetto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    foto LONGBLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Reward (
    codice INT AUTO_INCREMENT PRIMARY KEY,
    nome_progetto VARCHAR(255) NOT NULL,
    descrizione TEXT NOT NULL,
    foto LONGBLOB NOT NULL,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Finanziamento (
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    importo FLOAT NOT NULL,
    data DATE NOT NULL,
    codice_reward INT NOT NULL,
    PRIMARY KEY (email_utente, nome_progetto, data),
    FOREIGN KEY (email_utente) REFERENCES Utente(email),
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome),
    FOREIGN KEY (codice_reward) REFERENCES Reward(codice)
);

CREATE TABLE IF NOT EXISTS Commento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (email_utente) REFERENCES Utente(email),
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome)
);

CREATE TABLE IF NOT EXISTS RispostaCommento (
    id_commento INT PRIMARY KEY,
    email_creatore VARCHAR(255) NOT NULL,
    testo TEXT NOT NULL,
    FOREIGN KEY (id_commento) REFERENCES Commento(id) ON DELETE CASCADE,
    FOREIGN KEY (email_creatore) REFERENCES Creatore(email_utente) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ProgettoHardware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS ProgettoComponente (
    nome_progetto VARCHAR(255),
    nome_componente VARCHAR(100),
    quantita INT NOT NULL CHECK (quantita > 0),
    descrizione TEXT NOT NULL,
    prezzo INT NOT NULL,
    PRIMARY KEY (nome_progetto, nome_componente),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoHardware(nome_progetto) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS ProgettoSoftware (
    nome_progetto VARCHAR(255) PRIMARY KEY,
    FOREIGN KEY (nome_progetto) REFERENCES Progetto(nome) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ProgettoProfilo (
    nome_progetto VARCHAR(255) NOT NULL,
    nome_profilo VARCHAR(100) NOT NULL,
    PRIMARY KEY (nome_progetto, nome_profilo),
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS SkillsProfilo (
    nome_profilo VARCHAR(100) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    nome_skill VARCHAR(100),
    livello INT,
    PRIMARY KEY (nome_profilo, nome_progetto, nome_skill, livello),
    FOREIGN KEY (nome_progetto, nome_profilo) REFERENCES ProgettoProfilo(nome_progetto, nome_profilo),
    FOREIGN KEY (nome_skill, livello) REFERENCES CurriculumSkill(nome_skill, livello)
);

CREATE TABLE IF NOT EXISTS Candidatura (
    email_utente VARCHAR(255) NOT NULL,
    nome_progetto VARCHAR(255) NOT NULL,
    nome_profilo VARCHAR(100) NOT NULL,
    accettata BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (email_utente, nome_progetto, nome_profilo),
    FOREIGN KEY (email_utente) REFERENCES Utente(email) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto) REFERENCES ProgettoSoftware(nome_progetto) ON DELETE CASCADE,
    FOREIGN KEY (nome_progetto, nome_profilo) REFERENCES ProgettoProfilo(nome_progetto, nome_profilo)
);

CREATE EVENT IF NOT EXISTS ChiudiProgettiScaduti
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    UPDATE Progetto
    SET stato = 'chiuso'
    WHERE data_limite < CURDATE() AND stato = 'aperto';

DROP TRIGGER IF EXISTS AggiornaStatoProgetto;
DROP TRIGGER IF EXISTS AggiornaAffidabilitaDopoCreazioneProgetto;
DROP TRIGGER IF EXISTS AggiornaAffidabilitaDopoFinanziamento;

DROP PROCEDURE IF EXISTS AggiungiProgettoHardware;
DROP PROCEDURE IF EXISTS AggiungiProgettoSoftware;
DROP PROCEDURE IF EXISTS AggiungiSkillProgettoSoftware;
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

DROP VIEW IF EXISTS View_user_features;
DROP VIEW IF EXISTS View_general_project;
DROP VIEW IF EXISTS View_top_creators;
DROP VIEW IF EXISTS View_progetti_vicini_completamento;
DROP VIEW IF EXISTS View_top_funders;

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

DELIMITER $$

CREATE TRIGGER AggiornaAffidabilitaDopoCreazioneProgetto
AFTER INSERT ON Progetto
FOR EACH ROW
BEGIN

    DECLARE numeratore INT DEFAULT 0;
    DECLARE denominatore INT DEFAULT 0;

    -- Incrementa il numero di progetti del creatore
    UPDATE Creatore
    SET nr_progetti = nr_progetti + 1
    WHERE email_utente = NEW.email_creatore;

    -- Calcola i progetti con almeno un finanziamento (numeratore)
    SELECT COUNT(DISTINCT P.nome)
    INTO numeratore
    FROM Progetto P
    JOIN Finanziamento F ON P.nome = F.nome_progetto
    WHERE P.email_creatore = NEW.email_creatore;

    -- Calcola il numero totale di progetti del creatore (denominatore)
    SELECT COUNT(*)
    INTO denominatore
    FROM Progetto
    WHERE email_creatore = NEW.email_creatore;

    -- Aggiorna l'affidabilità 
    UPDATE Creatore
    SET affidabilita = IF(denominatore = 0, 0, ROUND((numeratore / denominatore) * 100))
    WHERE email_utente = NEW.email_creatore;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER AggiornaAffidabilitaDopoFinanziamento
AFTER INSERT ON Finanziamento
FOR EACH ROW
BEGIN
    DECLARE email_creatore VARCHAR(255);
    DECLARE numeratore INT DEFAULT 0;
    DECLARE denominatore INT DEFAULT 0;

    -- Trova l'email del creatore del progetto finanziato
    SELECT P.email_creatore INTO email_creatore
    FROM Progetto P
    WHERE P.nome = NEW.nome_progetto;

    -- Conta i progetti del creatore che hanno almeno un finanziamento
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

    -- Aggiorna l'affidabilità
    UPDATE Creatore
    SET affidabilita = IF(denominatore = 0, 0, ROUND((numeratore / denominatore) * 100))
    WHERE email_utente = email_creatore;
END$$

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

    -- Controlla se il progetto � aperto
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

CREATE PROCEDURE InserisciRispostaCommento(
    IN p_id_commento INT,
    IN p_email_creatore VARCHAR(255),
    IN p_testo TEXT
)
BEGIN
    -- Controlla se il commento esiste
    IF EXISTS (SELECT 1 FROM Commento WHERE id = p_id_commento) THEN
        -- Controlla se l'email appartiene a un creatore
        IF EXISTS (SELECT 1 FROM Creatore WHERE email_utente = p_email_creatore) THEN
            -- Inserisce la risposta nella tabella RispostaCommento
            INSERT INTO RispostaCommento (id_commento, email_creatore, testo)
            VALUES (p_id_commento, p_email_creatore, p_testo);
        ELSE
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Email fornita non appartiene a un creatore.';
        END IF;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il commento specificato non esiste.';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE InviaCandidatura(
    IN email_utente VARCHAR(255),
    IN nome_progetto_input VARCHAR(255),
    IN nome_profilo_input VARCHAR(255)
)
BEGIN
    DECLARE candidatura_esistente INT;
    DECLARE ha_skill_necessarie INT;

    -- Verifica se l'utente ha già inviato una candidatura
    SELECT COUNT(*) INTO candidatura_esistente
    FROM Candidatura
    WHERE email_utente = email_utente 
      AND nome_progetto = nome_progetto_input 
      AND nome_profilo = nome_profilo_input;

    IF candidatura_esistente > 0 THEN
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
      AND p.emailUtente IS NULL;  -- Cerca skill mancanti

    IF ha_skill_necessarie > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SKILL_NON_SODDISFATTE';
    END IF;

    -- Inserisci la candidatura se tutto è corretto
    INSERT INTO Candidatura(email_utente, nome_progetto, nome_profilo)
    VALUES (email_utente, nome_progetto_input, nome_profilo_input);
END $$

DELIMITER ;

DELIMITER $$

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

        -- Controlla se la candidatura è già accettata
        SELECT accettata INTO già_accettata
        FROM Candidatura
        WHERE email_utente = p_email_candidato
          AND nome_progetto = p_nome_progetto
          AND nome_profilo = p_nome_profilo
        LIMIT 1;

        IF candidatura_esistente = 0 THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Candidatura non trovata.';
        ELSEIF già_accettata THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Candidatura già accettata.';
        ELSE
            UPDATE Candidatura
            SET accettata = TRUE
            WHERE email_utente = p_email_candidato
              AND nome_progetto = p_nome_progetto
              AND nome_profilo = p_nome_profilo;
        END IF;
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

-- Implementazione viste per visualizzare le statistiche

CREATE VIEW View_top_creators AS
SELECT 
    U.nickname
FROM Creatore C
JOIN Utente U ON C.email_utente = U.email
ORDER BY C.affidabilita DESC
LIMIT 3;

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

CREATE VIEW View_top_funders AS
SELECT 
    U.nickname,
    COALESCE(SUM(F.importo), 0) AS TotaleFinanziato
FROM Utente U
JOIN Finanziamento F ON U.email = F.email_utente
GROUP BY U.nickname
ORDER BY TotaleFinanziato DESC
LIMIT 3;