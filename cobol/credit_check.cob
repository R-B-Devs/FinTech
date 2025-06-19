       IDENTIFICATION DIVISION.
       PROGRAM-ID. CREDITCHECK.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT TRANS-FILE ASSIGN TO 'transactions.csv'
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD  TRANS-FILE
           RECORD CONTAINS 80 CHARACTERS
           BLOCK CONTAINS 0 RECORDS
           DATA RECORD IS TRANS-REC.
       01  TRANS-REC                 PIC X(80).

       WORKING-STORAGE SECTION.
       01  WS-STATUS                 PIC XX.
       01  WS-ID                     PIC 9(4).
       01  WS-USER-ID                PIC 9(4).
       01  WS-TYPE                   PIC X(10).
       01  WS-AMOUNT                 PIC 9(7)V99.
       01  WS-CATEGORY               PIC X(30).
       01  WS-DATE                   PIC X(10).

       01  WS-CREDIT-TOTAL           PIC 9(7)V99 VALUE 0.
       01  WS-DEBIT-TOTAL            PIC 9(7)V99 VALUE 0.
       01  WS-NET-BALANCE            PIC 9(7)V99 VALUE 0.

       01  EOF-FLAG                  PIC X VALUE 'N'.
           88  EOF-YES              VALUE 'Y'.
           88  EOF-NO               VALUE 'N'.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           OPEN INPUT TRANS-FILE
           PERFORM UNTIL EOF-YES
               READ TRANS-FILE
                   AT END
                       SET EOF-YES TO TRUE
                   NOT AT END
                       PERFORM PARSE-RECORD
               END-READ
           END-PERFORM
           CLOSE TRANS-FILE
           PERFORM DISPLAY-RESULT
           STOP RUN.

       PARSE-RECORD.
           UNSTRING TRANS-REC
               DELIMITED BY ","
               INTO WS-ID, WS-USER-ID, WS-TYPE, WS-AMOUNT, WS-CATEGORY, WS-DATE
           EVALUATE FUNCTION TRIM(WS-TYPE)
               WHEN 'credit'
                   ADD WS-AMOUNT TO WS-CREDIT-TOTAL
               WHEN 'debit'
                   ADD WS-AMOUNT TO WS-DEBIT-TOTAL
           END-EVALUATE.

       DISPLAY-RESULT.
           COMPUTE WS-NET-BALANCE = WS-CREDIT-TOTAL - WS-DEBIT-TOTAL
           DISPLAY "Total Credit: " WS-CREDIT-TOTAL
           DISPLAY "Total Debit : " WS-DEBIT-TOTAL
           DISPLAY "Net Balance : " WS-NET-BALANCE
           PERFORM CHECK-CREDIT-SCORE.

       CHECK-CREDIT-SCORE.
           IF WS-NET-BALANCE > 5000
               DISPLAY "Credit Score: EXCELLENT"
           ELSE IF WS-NET-BALANCE > 3000
               DISPLAY "Credit Score: GOOD"
           ELSE IF WS-NET-BALANCE > 1000
               DISPLAY "Credit Score: FAIR"
           ELSE
               DISPLAY "Credit Score: POOR"
           END-IF.
        END PROGRAM CREDITCHECK.