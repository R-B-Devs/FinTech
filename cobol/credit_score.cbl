       IDENTIFICATION DIVISION.
       PROGRAM-ID. CREDITCHECK.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT TRANSACTION-FILE ASSIGN TO 'transactions.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO 'credit_score.csv'
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD TRANSACTION-FILE.
       01 TRANSACTION-RECORD       PIC X(500).

       FD OUTPUT-FILE.
       01 OUTPUT-RECORD            PIC X(100).

       WORKING-STORAGE SECTION.
       01 WS-EOF                   PIC X VALUE 'N'.
       01 WS-LINE                  PIC X(500).

       01 TRANSACTION-DATA.
           05 F-TRANSACTION-ID     PIC X(36).
           05 F-ACCOUNT-ID         PIC X(36).
           05 F-TYPE               PIC X(6).

           05 F-AMOUNT             PIC S9(7)V99.
           05 F-DESC               PIC X(30).
           05 F-CATEGORY           PIC X(15).
           05 F-MERCHANT           PIC X(25).
           05 F-DATE               PIC X(26).
           05 F-BAL-AFTER          PIC S9(7)V99.
           05 F-LOCATION           PIC X(30).
           05 F-SUSPICIOUS         PIC X(5).
           05 F-PROCESSED          PIC X(5).

       01 WS-INCOME                PIC S9(9)V99 VALUE 0.
       01 WS-EXPENSES             PIC S9(9)V99 VALUE 0.
       01 WS-SUSPICIOUS-COUNT     PIC 9(4) VALUE 0.
       01 WS-LARGE-DEBITS         PIC 9(4) VALUE 0.
       01 WS-LAST-BALANCE         PIC S9(9)V99 VALUE 0.
       01 WS-CREDIT-SCORE         PIC 9(4) VALUE 600.
       01 TEMP-VALUE              PIC S9(5)V99.

       PROCEDURE DIVISION.
       MAIN-PARAGRAPH.
           OPEN INPUT TRANSACTION-FILE
           OPEN OUTPUT OUTPUT-FILE

           PERFORM UNTIL WS-EOF = 'Y'
               READ TRANSACTION-FILE
                   AT END
                       MOVE 'Y' TO WS-EOF
                   NOT AT END
                       MOVE TRANSACTION-RECORD TO WS-LINE
                       PERFORM PARSE-LINE
                       PERFORM UPDATE-METRICS
               END-READ
           END-PERFORM

           PERFORM COMPUTE-CREDIT-SCORE
           PERFORM WRITE-RESULT

           CLOSE TRANSACTION-FILE
           CLOSE OUTPUT-FILE
           STOP RUN.

       PARSE-LINE.
           UNSTRING WS-LINE DELIMITED BY ","
               INTO F-TRANSACTION-ID, F-ACCOUNT-ID, F-TYPE,
                    F-AMOUNT, F-DESC, F-CATEGORY, F-MERCHANT,
                    F-DATE, F-BAL-AFTER, F-LOCATION,
                    F-SUSPICIOUS, F-PROCESSED.

       UPDATE-METRICS.
           IF F-TYPE = "CREDIT" AND F-AMOUNT > 0
               ADD F-AMOUNT TO WS-INCOME
           END-IF

           IF F-TYPE = "DEBIT" AND F-AMOUNT < 0
               ADD FUNCTION ABS(F-AMOUNT) TO WS-EXPENSES
               IF FUNCTION ABS(F-AMOUNT) > 1000
                   ADD 1 TO WS-LARGE-DEBITS
               END-IF
           END-IF

           IF F-SUSPICIOUS = "true"
               ADD 1 TO WS-SUSPICIOUS-COUNT
           END-IF

           IF F-BAL-AFTER NOT = 0
               MOVE F-BAL-AFTER TO WS-LAST-BALANCE
           END-IF.

       COMPUTE-CREDIT-SCORE.
           *> Income Boost
           COMPUTE WS-CREDIT-SCORE = WS-CREDIT-SCORE +
               (WS-INCOME / 1000 * 20)

           *> Expense Penalty
           IF WS-EXPENSES > 0
               COMPUTE WS-CREDIT-SCORE = WS-CREDIT-SCORE -
                   (WS-EXPENSES / 1000 * 10)
           END-IF

           *> Suspicious Transactions Penalty
           COMPUTE TEMP-VALUE = WS-SUSPICIOUS-COUNT * 15
           SUBTRACT TEMP-VALUE FROM WS-CREDIT-SCORE

           *> Large Debits Penalty
           COMPUTE TEMP-VALUE = WS-LARGE-DEBITS * 5
           SUBTRACT TEMP-VALUE FROM WS-CREDIT-SCORE

           *> Ending Balance Bonus
           IF WS-LAST-BALANCE > 0
               COMPUTE TEMP-VALUE = WS-LAST-BALANCE / 1000
               ADD TEMP-VALUE TO WS-CREDIT-SCORE
           END-IF

           *> Normalize Range 300–850
           IF WS-CREDIT-SCORE < 300
               MOVE 300 TO WS-CREDIT-SCORE
           ELSE IF WS-CREDIT-SCORE > 850
               MOVE 850 TO WS-CREDIT-SCORE
           END-IF.

       WRITE-RESULT.
           MOVE "CREDIT_SCORE" TO OUTPUT-RECORD
           WRITE OUTPUT-RECORD

           MOVE WS-CREDIT-SCORE TO OUTPUT-RECORD
           WRITE OUTPUT-RECORD.
